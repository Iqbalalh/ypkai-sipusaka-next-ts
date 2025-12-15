export const extractKeyFromUrl = (url: string) => {
  try {
    const path = new URL(url).pathname; 
    // contoh: "/mybucket/employee/123-photo.png"

    const objectKey = path.split("/").slice(2).join("/"); 
    // hasil: "employee/123-photo.png"

    return `/database/${objectKey}`;
  } catch (err) {
    console.error("URL parse error:", err);
    return null;
  }
};
