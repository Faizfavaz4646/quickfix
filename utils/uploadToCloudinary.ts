export const uploadToCloudinary = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error('Cloudinary upload failed');
    }

    return await res.json();
  } catch (err) {
    console.error('Upload failed', err);
    throw err;
  }
};
