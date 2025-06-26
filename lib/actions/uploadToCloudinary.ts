export async function uploadToCloudinary(file: File) {
	const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
	const form = new FormData();
	form.append("file", file);
	form.append("upload_preset", "comprobantes");

	const res = await fetch(url, {
		method: "POST",
		body: form,
	});

	if (!res.ok) throw new Error("Upload failed");
	const json = await res.json();
	return json.secure_url as string;
}
