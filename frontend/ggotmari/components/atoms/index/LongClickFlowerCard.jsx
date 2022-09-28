import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import { getFlowerDetail } from "../../../api/flower";

import Swal from "sweetalert2";

function LongClickFlowerCard({
  info: { subjectId, kindId, flowerName, imgUrl },
}) {
  const router = useRouter();
  const handlePostClick = () => {
    router.push(
      {
        pathname: `flower/${subjectId}`,
      },
      `flower/${subjectId}`
    );
  };

  // useEffect(() => {
  //   console.log(router.query.subjectId);
  //   getFlowerDetail(
  //     router.query.subjectId,
  //     (res) => {
  //       console.log(res.data);
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }, []);

  // TODO: 스타일 적용, 사이즈 조절
  const openSwal = () => {
    Swal.fire({
      title: `정말 ${flowerName} 추천을 그만 받으시겠습니까?`,
      text: "추천을 그만 받으면 앞으로 해당 꽃이 표시 되지 않습니다.",
      width: 300,
      height: 250,
      // icon: "warning",
      // showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: "#FFD365",
      denyButtonColor: "#709FB0",
      // cancelButtonColor: "#d33",
      confirmButtonText: "네",
      denyButtonText: "아니요",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      }
    });
  };

  // TODO: long press event => 꾹 눌렀을 때 alert
  // TODO: 일반 클릭 시 링크 이동

  const [action, setAction] = useState("");
  const timerRef = useRef();
  const isLongPress = useRef();

  function startPressTimer() {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setAction("longpress");
    }, 500);
  }

  function handleOnClick(e) {
    console.log("handleOnClick");
    if (isLongPress.current) {
      console.log("Is long press - not continuing.");
      return;
    }
    setAction("click");
  }

  function handleOnMouseDown() {
    console.log("handleOnMouseDown");
    startPressTimer();
  }

  function handleOnMouseUp() {
    console.log("handleOnMouseUp");
    clearTimeout(timerRef.current);
  }

  function handleOnTouchStart() {
    console.log("handleOnTouchStart");
    startPressTimer();
  }

  function handleOnTouchEnd() {
    if (action === "longpress") return;
    console.log("handleOnTouchEnd");
    clearTimeout(timerRef.current);
  }

  const successLongClick = () => {
    console.log("successful long click");
    openSwal();
    setAction(undefined);
  };

  return (
    <div>
      <div
        // onClick={handlePostClick}
        onClick={handleOnClick}
        onMouseDown={handleOnMouseDown}
        onMouseUp={handleOnMouseUp}
        onTouchStart={handleOnTouchStart}
        onTouchEnd={handleOnTouchEnd}
        className=" cursor-pointer rounded-lg aspect-square overflow-hidden relative brightness-96"
      >
        {/* <img
        className="w-full h-full object-cover"
        src={imgUrl}
        alt={flowerName}
      /> */}
        <Image src={imgUrl} alt={flowerName} layout="fill" objectFit="cover" />

        {/* {!action && clearAction()} */}
        {/* {action === "click" && handlePostClick()}
      {action === "longpress" && openSwal()} */}
      </div>

      <div>
        {/* {!action &} */}
        {action === "click" && handlePostClick()}
        {action === "longpress" && successLongClick()}
        {/* {action === "longpress" && console.log("long click")} */}
      </div>
    </div>
  );
}

export default LongClickFlowerCard;
