import React, { useState } from "react";
import { urlFor, client } from "../client";
import { v4 as uuidv4 } from "uuid";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import { BsFillArrowUpRightCircleFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { fetchUser } from "../utils/fetchUser";

const Pin = ({ pin: { postedBy, image, _id, destination, save } }) => {
  console.log("_id", _id);
  const navigate = useNavigate();
  const [postHovered, setPostHovered] = useState(false);
  const [savingPost, setsavingPost] = useState(false);
  const user = fetchUser();

  console.log("user.googleId", user);
  const alreadySaved = !!save?.filter((item) => item.postedBy?._id === user.sub)
    ?.length;

  const deletePin = (id) => {
    client.delete(id).then(() => {
      window.location.reload();
    });
  };
  const savePin = (id) => {
    console.log("alreadySaved", alreadySaved);
    if (!alreadySaved) {
      setsavingPost(true);
      client
        .patch(id)
        .setIfMissing({ save: [] })
        .insert("after", "save[-1]", [
          {
            _key: uuidv4(),
            userId: user.sub,
            postedBy: {
              _type: "postedBy",
              _ref: user.sub,
            },
          },
        ])
        .commit()
        .then(() => {
          window.location.reload();
          setsavingPost(false);
        });
    }
  };

  return (
    <div className="m-2">
      <div
        onMouseEnter={() => setPostHovered(true)}
        onMouseLeave={() => setPostHovered(false)}
        onClick={() => navigate(`/pin-details/${_id}`)}
        className="relative cursor-zoom-in w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
      >
        <img
          className="rounded-lg w-full"
          alt="user-post"
          src={urlFor(image).width(250).url()}
        />
        {postHovered && (
          <div
            className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
            style={{ height: "100%" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <a
                  href={`${image?.asset?.url}?dl=`}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-9 h-9 rounded-full flex items-center justify-center text-slate-900 text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
                >
                  <MdOutlineDownloadForOffline />
                </a>
              </div>
              {alreadySaved ? (
                <button
                  type="button"
                  className="bg-red-500 pointer-events-none text-white opacity-70 hover:opacity-100 font-bold px-5 py-1 text-base rounded-3xl hover:shadow-lg outline-none"
                >
                  {save?.length}Saved
                </button>
              ) : (
                <button
                  type="button"
                  className="bg-red-500 text-white opacity-70 hover:opacity-100 font-bold px-5 py-1 text-base rounded-3xl hover:shadow-lg outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    savePin(_id);
                  }}
                >
                  Save
                </button>
              )}
            </div>
            <div className="flex justify-between items-center gap-2 w-full">
              {destination && (
                <a
                  href={destination}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white flex text-black items-center gap-2 font-bold p-2 px-4 rounded-full opacity-70 hover:opacity-100 hover:shadow-md"
                >
                  <BsFillArrowUpRightCircleFill />
                  {destination?.length > 20
                    ? destination?.slice(8, 20)
                    : destination?.slice(8)}
                </a>
              )}
              {postedBy._id === user.sub && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // deletePin(_id)
                  }}
                  className="bg-white text-gray-700 opacity-70 hover:opacity-100 font-bold px-2 py-2 text-base rounded-full hover:shadow-lg outline-none"
                >
                  <AiTwotoneDelete />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Link
        to={`user-profile/${user?.id}`}
        className="flex gap-2 mt-2 items-center"
      >
        <img
          className="w-8 h-8 rounded-full object-cover"
          src={postedBy?.image}
          alt="user profile"
        ></img>
        <p className="font-semibold capitalize">{postedBy?.userName}</p>
      </Link>
    </div>
  );
};

export default Pin;