import { useEffect, useState } from "react";
import axios from "axios";

interface RandomImageProps {
  section: string;
}

interface ImageRecord {
  fields: {
    Name?: string;
    Section?: string;
    "Image URL"?: string;
  };
}

export default function RandomImage({ section }: RandomImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState<string>("");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await axios.get(
          "https://api.airtable.com/v0/appjTo5dzo5KFAZ0T/Images", // replace YOUR_BASE_ID
          {
            headers: {
              Authorization: "Bearer patvLwFnGbCekBMKT.cfa67ed24d708aebbb5b8ba505a8ab45efee816d127d87523beb3aff58ade800", // replace YOUR_API_KEY
            },
            params: {
              filterByFormula: `{Section}="${section}"`,
            },
          }
        );

        const records: ImageRecord[] = res.data.records;
        if (records.length > 0) {
          const randomRecord = records[Math.floor(Math.random() * records.length)];
          setImageUrl(randomRecord.fields["Image URL"] || "");
          setAltText(randomRecord.fields.Name || "Image");
        }
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    };

    fetchImage();
  }, [section]);

  if (!imageUrl) return null;

  return (
    <div className="w-full h-[500px] overflow-hidden">
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
console.log("Hero image URL:", selectedImage?.url);
}
