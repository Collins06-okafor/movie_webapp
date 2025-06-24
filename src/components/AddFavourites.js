import React from 'react';

const AddFavourite = () => {
  return (
    <>
      <span className='mr-2'>Add to Favourites</span>
      <svg
        width='1em'
        height='1em'
        viewBox='0 0 16 16'
        className='bi bi-heart-fill'
        fill='currentColor'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          fillRule='evenodd'
          d='M8 1C5.053 1 2 4.053 2 7c0 3.226 3.71 5.912 5.382 7.09a.713.713 0 0 0 .764 0C10.29 12.912 14 10.226 14 7c0-2.947-3.053-6-6-6z'
        />
      </svg>
    </>
  );
};

export default AddFavourite;
