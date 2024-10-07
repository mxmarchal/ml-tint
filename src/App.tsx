import { FormEvent, useState, ChangeEvent, useRef, useEffect } from "react";

import { generateClient } from "aws-amplify/api";
import { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

type RekognitionLabel = {
  label: string;
  confidence: number;
  boundingBox: {
    width: number;
    height: number;
    left: number;
    top: number;
  };
};

export default function App() {

  const mockup = {
    data: {
      getLabels: "[{\"label\":\"Couch\",\"confidence\":99.96634674072266,\"boundingBox\":{\"width\":0.48826900124549866,\"height\":0.29207471013069153,\"left\":0.36304885149002075,\"top\":0.5132207870483398}},{\"label\":\"Painting\",\"confidence\":99.80794525146484,\"boundingBox\":{\"width\":0.23743438720703125,\"height\":0.2845252752304077,\"left\":0.49235498905181885,\"top\":0.1835898607969284}},{\"label\":\"Remote Control\",\"confidence\":95.24906158447266,\"boundingBox\":{\"width\":0.02859063632786274,\"height\":0.0737098827958107,\"left\":0.8288939595222473,\"top\":0.8956727981567383}},{\"label\":\"Chair\",\"confidence\":69.44417572021484,\"boundingBox\":{\"width\":0.13970860838890076,\"height\":0.22323909401893616,\"left\":0.24057529866695404,\"top\":0.5551502108573914}}]"
    }
  }

  const [rekognitionLabels, setRekognitionLabels] = useState<RekognitionLabel[] | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState<number | null>(null);
  const [imageHeight, setImageHeight] = useState<number | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      convertToBase64(file);
    }
  };

  const convertToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBase64Image(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);


  const drawBoundingBox = (label: RekognitionLabel) => {
    console.log("Drawing bounding box", label);
    const { width, height, left, top } = label.boundingBox;

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (context && canvas) {
      // Get the actual dimensions of the canvas
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Calculate the actual dimensions and position based on percentages
      const boxWidth = width * canvasWidth;
      const boxHeight = height * canvasHeight;
      const boxLeft = left * canvasWidth;
      const boxTop = top * canvasHeight;

      // Set styles for semi-transparent green fill
      context.fillStyle = 'rgba(0, 255, 0, 0.3)';  // Semi-transparent green
      context.strokeStyle = 'rgba(0, 255, 0, 0.8)';  // More opaque green for border
      context.lineWidth = 2;

      // Draw the filled rectangle
      context.fillRect(boxLeft, boxTop, boxWidth, boxHeight);

      // Draw the border
      context.strokeRect(boxLeft, boxTop, boxWidth, boxHeight);

      // Set text style
      context.fillStyle = 'white';  // White text color
      context.strokeStyle = 'black';  // Black outline
      context.lineWidth = 3;
      context.font = '16px Arial';
      context.textBaseline = 'top';

      // Draw text background
      const textMetrics = context.measureText(label.label);
      const textWidth = textMetrics.width;
      const textHeight = 20;  // Approximate height of the text
      context.fillStyle = 'rgba(0, 0, 0, 0.5)';  // Semi-transparent black background
      context.fillRect(boxLeft, boxTop, textWidth + 6, textHeight);

      // Draw text
      context.strokeText(label.label, boxLeft + 3, boxTop + 2);
      context.fillStyle = 'white';
      context.fillText(label.label, boxLeft + 3, boxTop + 2);
    }
  }


  useEffect(() => {
    if (base64Image && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 900;
          let width = img.width;
          let height = img.height;

          setImageWidth(width);
          setImageHeight(height);

          if (width > maxWidth) {
            const scaleFactor = maxWidth / width;
            width = maxWidth;
            height = height * scaleFactor;
          }

          canvas.width = width;
          canvas.height = height;
          context.drawImage(img, 0, 0, width, height);

        };
        img.src = base64Image;
      }
    }
  }, [base64Image]);

  const getLabels = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!base64Image) {
      console.log("No image selected");
      return;
    }

    // const { data, errors } = await client.queries.getLabels({
    //   image: base64Image.split(',')[1],
    // });

    const { data, errors } = {
      data: mockup.data.getLabels,
      errors: null
    };

    if (errors) {
      console.log(errors);
      return;
    }

    const dataParsed = data ? (JSON.parse(data as string)) : null;
    const assertionData = dataParsed as RekognitionLabel[];
    setRekognitionLabels(assertionData);

    assertionData.forEach((label) => drawBoundingBox(label));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 dark:text-white">
      <div>
        <h1 className="text-3xl font-bold text-center mb-4">ML Tint</h1>
        <form onSubmit={getLabels} className="mt-4">
          {base64Image && (
            <div className="mb-4 max-w-[900px] mx-auto">
              <canvas ref={canvasRef} className="w-full h-auto" />
            </div>
          )}
          {rekognitionLabels && (
            <div>
              {rekognitionLabels.map((label, index) => (
                <div key={index}>
                  <p>Name: {label.label}</p>
                  <p>Confidence: {label.confidence}</p>
                </div>
              ))}
            </div>
          )}
          <input
            className="text-black p-2 w-full"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
          />
          <button type="submit" className="mt-2 p-2 bg-blue-500 text-white rounded">Get Labels</button>
        </form>
      </div>
    </main>
  );
}