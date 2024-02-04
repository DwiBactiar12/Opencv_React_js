import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [isOn, setIsOn] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [processedFrame, setProcessedFrame] = useState(null);
  const [amountPeople, setAmountPeople] = useState(null);

  const WIDTH = 500;
  const HEIGHT = 500;

  const startWebCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      let video = document.getElementsByClassName("app__videoFeed")[0];
      if (video) {
        video.srcObject = stream;
      }
      setIsOn(true);

      // Start sending video frames every 5 seconds
      const id = setInterval(() => {
        sendVideoData();
      }, 290);
      setIntervalId(id);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  console.log(processedFrame, "processedFrame")

  const stopWebCam = () => {
    let video = document.getElementsByClassName("app__videoFeed")[0];
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsOn(false);

    // Clear the interval when stopping the webcam
    setProcessedFrame(null)
    clearInterval(intervalId);
    setIntervalId(null);
  };

  const sendVideoData = async () => {
    try {
      let video = document.getElementsByClassName("app__videoFeed")[0];
      let canvas = document.createElement("canvas");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      let context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, WIDTH, HEIGHT);
      const imageDataURL = canvas.toDataURL("image/jpeg");
      const response = await axios.post("http://localhost:5000/process_video", {
        video_data: imageDataURL
      });

      setProcessedFrame(response.data.processed_frame_with_rectangles);
      setAmountPeople(response.data.person_counter)
    } catch (error) {
      console.error("Error sending or processing video data:", error);
    }
  };

  const toggleOnOff = () => {
    if (!isOn) {
      console.log("Start Video");
      startWebCam();
    } else {
      console.log("Stop Video");
      stopWebCam();
    }
  };

  return (
    <div className="w-[100vw] h-[100vh]  bg-[#1D232A]">
      <div className=" text-5xl text-center pt-5 mb-10">People Counting</div>
      <div className="mx-10 ">
        <div className="text-2xl mb-3">Camera</div>
        <div className="flex items-center gap-5 ">
          <div>OFF</div>
          <input
            type="checkbox"
            className="toggle toggle-lg toggle-accent"
            onClick={toggleOnOff}
            checked={isOn}
          />
          <div>ON</div>
        </div>
      </div>
      <div className="m-10">
        <div className="rounded-2xl bg-blue-400 items-center md:items-stretch md:justify-around flex flex-col md:flex-row  overflow-hidden">
          <div className="border rounded-xl overflow-hidden m-3">
            <div className="font-semibold text-center text-black text-xl">Real</div>
            <video muted autoPlay className="app__videoFeed" style={{ width: `${WIDTH}px`, height: `${HEIGHT}px` }}></video>
          </div>

          {processedFrame && isOn && (
            <div className="border rounded-xl overflow-hidden m-3">
              <h1 className="font-semibold text-center text-black text-xl">Processed Frame</h1>
              <img src={`data:image/jpeg;base64,${processedFrame}`} alt="Processed Frame" />
              <div className="text-black text-xl px-5">Amount People :  {amountPeople}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
