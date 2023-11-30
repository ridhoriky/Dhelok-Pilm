import React, { useState, useEffect } from 'react';
import GlobalAPI from '../sevices/GlobalAPI';
import { db } from '../sevices/Firebase';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router';
import { UserAuth } from '../context/AuthContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLike } from '../context/LikeContext';
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMG_URL;

const DetailPage = () => {
  const [details, setDetails] = useState(null);
  const { isLiked, toggleLike } = useLike();
  const [saved, setSaved] = useState(false);

  const { user } = UserAuth();
  const { id, type } = useParams();

  useEffect(() => {
    GlobalAPI.getDetailsById(id, type).then((result) => {
      setDetails(result);
    });
  }, [id, type]);

  const movieID = user?.email ? doc(db, 'users', user.email) : null;

  const saveShow = async () => {
    if (user?.email) {
      toggleLike(id);
      setSaved(true);
      await updateDoc(movieID, {
        savedShows: arrayUnion({
          id: details.id,
          title: details.title || details.name,
          img: details.poster_path || details.profile_path,
        }),
      });
    } else {
      alert('Please log in to save a movie');
    }
  };

  const url = IMAGE_BASE_URL + (details?.poster_path || details?.profile_path);

  return (
    <div className="mt-20 px-4 md:px-[10%]">
      <div className="text-sm breadcrumbs">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to={`/${type}`} className="capitalize">
              {type}
            </Link>
          </li>
          <li>Details</li>
        </ul>
      </div>
      {details ? (
        <div className="xl:flex justify-between">
          <div className="w-full xl:w-1/3">
            <img
              className="w-full h-[700px] object-cover rounded-md my-5 xl:my-10"
              src={
                (details?.poster_path || details?.profile_path) === null
                  ? 'https://img.freepik.com/free-vector/coming-soon-banner-with-focus-lights_1017-33739.jpg?size=626&ext=jpg&ga=GA1.1.492795408.1700300440&semt=ais'
                  : url
              }
              alt={details?.title || details?.name}
            />
          </div>
          <div className="w-full xl:w-2/3 pl-2 xl:pl-10  my-5 xl:my-10">
            <h2 className="text-3xl mb-5">{details?.title || details?.name}</h2>
            {details?.birthday && (
              <div className="font-semibold text-white/80 mb-4">
                Birthday:{' '}
                <span className="font-light">{details?.birthday}</span>
              </div>
            )}

            {details?.genres && (
              <div className="font-semibold text-white/80 mb-4">
                Genres:{' '}
                <span>
                  {details?.genres?.map((genre, index) => (
                    <span className="font-light" key={genre.id}>
                      {genre.name}
                      {index !== details.genres.length - 1 && ', '}
                    </span>
                  ))}
                </span>
              </div>
            )}

            {details?.popularity && (
              <div className="font-semibold text-white/80 mb-4">
                Popularity:{' '}
                <span className="font-light">{details?.popularity}</span>
              </div>
            )}

            {details?.release_date ||
              (details.first_air_date && (
                <div className="font-semibold text-white/80 mb-4">
                  Released:{' '}
                  <span className="font-light">
                    {details?.release_date || details.first_air_date}
                  </span>
                </div>
              ))}

            <p className="text-white/70 my-4">{details?.overview}</p>
            <p className="text-white/70">{details?.biography}</p>
            <p onClick={saveShow} className=" z-50 cursor-pointer mt-8">
              {isLiked(details.id) ? (
                <span className="flex items-center justify-center w-fit rounded-md gap-2 border-2 p-2">
                  <FaHeart size={24} title="Delete From Wishlist" /> Delete From
                  Wishlist
                </span>
              ) : (
                <span className="flex items-center justify-center w-fit rounded-md gap-2 border-2 p-2">
                  <FaRegHeart size={24} title="Add to Wishlist" /> Add to
                  Wishlist
                </span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DetailPage;
