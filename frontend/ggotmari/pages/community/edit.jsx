import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";

import { ArticleToast } from "../../components/atoms/common/Toast";
import FlowerTag from "../../components/atoms/common/FlowerTag";

import { editArticle, getFlowerKind, postArticle } from "../../api/community";

import { IoRefreshOutline, IoImagesOutline } from "react-icons/io5";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { BsCamera } from "react-icons/bs";

export async function getServerSideProps(context) {
  return {
    props: {},
  };
}

function EditArticle() {
  const router = useRouter();

  const [flowerKindList, setFlowerKindList] = useState([]);
  const [title, setTitle] = useState(
    router.query.title ? router.query.title : ""
  );
  const [content, setContent] = useState(
    router.query.content ? router.query.content : ""
  );
  const [flowerTags, setFlowerTags] = useState(
    router.query.tags ? JSON.parse(router.query.tags) : []
  );
  const [imagePreviews, setImagePreviews] = useState(
    router.query.images ? JSON.parse(router.query.images) : []
  );
  const [tagSearch, setTagSearch] = useState("");
  const [flowerTagIds, setFlowerTagIds] = useState(
    router.query.tags
      ? JSON.parse(router.query.tags).map((tag) => tag.subjectId)
      : []
  );
  const [filteredList, setFilteredList] = useState([]);
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState();
  const [tooltip, setTooltip] = useState(false);
  const timerRef = useRef();

  var isSubmit = false;

  useEffect(() => {
    getFlowerKind(
      (res) => {
        setFlowerKindList(res.data.subjects);
        setFilteredList(res.data.subjects);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  useEffect(() => {
    setFilteredList(
      flowerKindList.filter((flowerKind) =>
        flowerKind.subjectName.startsWith(tagSearch)
      )
    );
  }, [tagSearch]);

  const addFlowerTag = (flower) => {
    const newFlowerId = flower.subjectId;
    if (!flowerTagIds.includes(newFlowerId)) {
      setFlowerTagIds([...flowerTagIds, newFlowerId]);
      setFlowerTags([...flowerTags, flower]);
    }
    setTagSearch("");
  };

  const removeFlowerTag = (flowerId) => {
    setFlowerTags(flowerTags.filter((tag) => tag.subjectId != flowerId));
    setFlowerTagIds(flowerTagIds.filter((id) => id != flowerId));
  };

  const handleFlowerSearchChange = (e) => {
    setTagSearch(e.target.value);
  };

  const handleImgUpload = (e) => {
    const fileArr = e.target.files;
    setImageFiles(fileArr);
    const fileURLs = [];
    [...fileArr].forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        fileURLs[idx] = reader.result;
        setImagePreviews([...fileURLs]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleArticleSubmit = (e) => {
    e.preventDefault();
    const mode = router.query.mode;

    if (!isSubmit) {
      isSubmit = true;
      // ????????? ??????
      if (imagePreviews.length == 0) {
        ArticleToast.fire({
          customClass: {
            title: "toast-title",
          },
          icon: "error",
          width: 340,
          title: "????????? ?????? 1??? ?????? ?????????????????????.",
        });
        isSubmit = false;
      } else if (title == "" || title.trim() === "") {
        ArticleToast.fire({
          customClass: {
            title: "toast-title",
          },
          icon: "error",
          width: 340,
          title: "????????? ??????????????????",
        });
        isSubmit = false;
      } else if (flowerTags.length == 0) {
        ArticleToast.fire({
          customClass: {
            title: "toast-title",
          },
          icon: "error",
          width: 340,
          title: "??? ????????? ?????? 1??? ?????? ??????????????????",
        });
        isSubmit = false;
      } else if (content == "" || content.trim() === "") {
        ArticleToast.fire({
          customClass: {
            title: "toast-title",
          },
          icon: "error",
          width: 340,
          title: "????????? ??????????????????",
        });
        isSubmit = false;
      } else {
        const formData = new FormData();
        const article = {
          title: title,
          content: content,
          subjects: flowerTagIds,
        };
        const json = JSON.stringify(article);
        formData.append(
          "articleInfo",
          new Blob([json], { type: "application/json" })
        );

        if (imageFiles != undefined) {
          [...imageFiles].forEach((file) => formData.append("images", file));
        }

        if (mode == "write") {
          postArticle(
            formData,
            (res) => {
              router.push(`/community/${res.data.articleId}`);
            },
            (err) => {
              Toast.fire({
                title: "????????? ????????? ?????????????????????",
              });
              isSubmit = false;
            }
          );
        } else if (mode == "edit") {
          editArticle(
            router.query.articleId,
            formData,
            (res) => {
              router.push(`/community/${res.data.articleId}`);
            },
            (err) => {
              Toast.fire({
                title: "????????? ????????? ?????????????????????",
              });
              isSubmit = false;
            }
          );
        }
      }
    }
  };

  const handleCancleClick = () => {
    const mode = router.query.mode;
    if (mode == "write") {
      router.push("/community");
    } else if (mode == "edit") {
      router.back();
    }
  };

  function handleOnTooltip() {
    setTooltip(true);
    timerRef.current = setTimeout(() => {
      setTooltip(false);
    }, 2000);
  }

  return (
    <div className="flex flex-col items-center w-screen">
      <Head>
        <title>STORY | GGOTMARI</title>
        <meta property="og:title" content="Article Edit" key="edit" />
        <meta name="description" content="User can write or edit article." />
      </Head>
      <div className="w-full aspect-square bg-font3">
        {imagePreviews.length > 0 ? (
          <div className="carousel w-full aspect-square">
            {imagePreviews.map((imgSrc, idx) => (
              <div className="carousel-item relative w-full h-full" key={idx}>
                <Image
                  src={imgSrc}
                  className="object-cover"
                  layout="fill"
                  priority
                />
              </div>
            ))}
          </div>
        ) : (
          <label
            className="w-full h-full flex justify-center items-center"
            htmlFor="flowerImg"
          >
            <IoImagesOutline className="text-9xl text-sub1" />
          </label>
        )}
      </div>
      <div className="text-font2 image-change flex justify-center items-center font-sanslight my-3">
        <label htmlFor="flowerImg">
          <span className="mr-2 text-sm font-sans flex items-center cursor-pointer">
            <BsCamera size={18} className="mr-1 mb-0.5" />
            ?????? ?????????
          </span>
        </label>
        <input
          type="file"
          id="flowerImg"
          accept="image/*"
          multiple
          onChange={handleImgUpload}
          className="w-0"
        />
        <span className="text-xl">|</span>
        <span
          className="ml-2 text-sm font-sans flex items-center cursor-pointer"
          onClick={() => {
            setImagePreviews([]);
            setImageFiles();
          }}
        >
          <IoRefreshOutline size={18} className="mr-0.5 mb-0.5" />
          ?????????
        </span>
      </div>
      <div className="w-full p-3">
        {/* ????????? ????????? */}
        <form
          className="flex flex-col w-full space-y-5 font-sans text-font2"
          onSubmit={handleArticleSubmit}
        >
          {/* ??? ?????? */}
          <div>
            <label
              htmlFor="articleTitle"
              className="pl-2 text-[16px] text-black"
            >
              ??? ??????
            </label>
            <input
              type="text"
              id="articleTitle"
              className="rounded-md shadow-sm w-full text-sm focus:outline-none focus:shadow-sub1 color-delay px-3 py-2"
              placeholder="????????? ???????????????"
              onFocus={() => setDropDownOpen(false)}
              onChange={handleTitleChange}
              value={title}
            />
          </div>
          {/* ??? ?????? */}
          <div>
            <div className="flex items-center">
              <label
                htmlFor="flowerTags"
                className="pl-2 text-[16px] text-black"
              >
                ??? ??????
              </label>
              <p className="px-2" onClick={handleOnTooltip}>
                <AiOutlineExclamationCircle size={14} />
              </p>
              <p
                className={`${
                  tooltip ? "text-font2" : "text-white"
                } text-xs ml-2 mt-0.5`}
              >
                ????????? ????????? ????????? ???????????????
              </p>
            </div>
            <div className="w-full shadow-sm rounded-md">
              {/* ????????? ??? ?????? ???????????? */}
              <div>
                <div className="flex flex-row flex-wrap px-4 py-3 text-sub1 text-sm">
                  {flowerTags.length > 0
                    ? flowerTags.map((flower) => (
                        <FlowerTag
                          flowerName={flower.subjectName}
                          key={flower.subjectId}
                          isRemovable={true}
                          onClick={() => removeFlowerTag(flower.subjectId)}
                        />
                      ))
                    : "????????? ??? ????????? ????????????"}
                </div>
                <hr />
              </div>
              {/* ??? ????????? */}
              <input
                type="text"
                className="w-full text-sm focus:outline-none p-3"
                placeholder="?????? ???????????????"
                onClick={() => setDropDownOpen(true)}
                onChange={handleFlowerSearchChange}
                value={tagSearch}
              />
              <hr />
              <div
                className={
                  "max-h-32 z-10 overflow-auto " +
                  (dropDownOpen ? "relative" : "hidden")
                }
              >
                {/* ??? ???????????? */}
                <div className="">
                  {filteredList.map((flower, idx) => (
                    <div
                      className="p-2 font-sans hover:bg-font3"
                      onClick={() => addFlowerTag(flower)}
                      key={idx}
                    >
                      {flower.subjectName}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* ????????? ?????? */}
          <div>
            <label
              htmlFor="articleContent"
              className="pl-2 text-[16px] text-black"
            >
              ??????
            </label>
            <textarea
              id="articleContent"
              rows="5"
              className="shadow-sm rounded-md focus:shadow-sub1 color-delay w-full text-sm focus:outline-none p-3"
              placeholder="????????? ???????????????"
              onFocus={() => setDropDownOpen(false)}
              value={content}
              onChange={handleContentChange}
            ></textarea>
          </div>
          <div className="btns-box px-5 mt-10 flex justify-end font-sans text-white text-sm">
            <div className="save-box">
              <button
                className="mr-2 bg-main w-full h-full px-5 py-2 rounded-md hover:bg-sub1 cursor-pointer"
                onClick={handleArticleSubmit}
              >
                {router.query.mode == "write" ? "??????" : "??????"}
              </button>
            </div>
            <div className="cancel-box">
              <button
                className="ml-2 bg-font2 w-full h-full px-5 py-2 rounded-md hover:bg-sub1 cursor-pointer"
                onClick={handleCancleClick}
              >
                ??????
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="h-14"></div>
    </div>
  );
}

export default EditArticle;
