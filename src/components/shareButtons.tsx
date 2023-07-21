import React, { useState } from "react";
import { toast } from "react-toastify";
import { MdOutlineContentCopy } from "react-icons/md";
import { ShareViaIcon } from "./icon";
import { FacebookIcon, WhatsappIcon } from "react-share";

const ShareButtons = ({ userData, link }: { userData: any; link: any }) => {
  const [share, setShare] = useState(false);
  const shareText = `Check out ${userData}'s profile on MyApp: ${link}`;

  const handleShareWhatsapp = () => {
    const encodedText = encodeURIComponent(shareText);
    window.location.href = `whatsapp://send?text=${encodedText}`;
  };

  const handleShareFacebook = () => {
    const encodedLink = encodeURIComponent(link);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
      "_blank"
    );
  };

  const handleShareTwitter = () => {
    const encodedTitle = encodeURIComponent(userData.displayName);
    const encodedLink = encodeURIComponent(link);
    const hashtags = encodeURIComponent("mandelo,Avalanche");
    const twitterUrl = `http://twitter.com/share?text=${encodedTitle}&url=${encodedLink}&hashtags=${hashtags}`;
    window.open(twitterUrl, "_blank");
  };

  const handleShareVia = () => {
    setShare(!share);
  };

  const handleCopyClick = async () => {
    const textToCopy = `${userData} - ${link}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // !Fallback option: create a temporary textarea to copy the text
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = textToCopy;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand("copy");
      document.body.removeChild(tempTextArea);
      alert("Quote and author copied to clipboard!");
    }
  };
  return (
    <>
      <div className="flex justify-between gap-2 ">
        <div className="flex items-center justify-center font-normal px-6 py-1 w-full text-[14px] border rounded cursor-pointer">
          <p
            onClick={handleCopyClick}
            className="flex flex-col items-center justify-center gap-1"
          >
            <MdOutlineContentCopy />
            <span>Copy Link </span>
          </p>
        </div>
        <div
          onClick={handleShareVia}
          className="flex items-center justify-center font-normal px-6 py-1 w-full text-[14px] border rounded cursor-pointer"
        >
          <p className="flex flex-col items-center justify-center gap-1">
            <ShareViaIcon /> <span>Share Via</span>
          </p>
        </div>
      </div>
      {share && (
        <div className="flex justify-center w-full gap-3">
          <button onClick={handleShareWhatsapp}>
            <svg
              width="47"
              height="47"
              viewBox="0 0 47 47"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_307_16)">
                <path d="M47 0H0V47H47V0Z" fill="#25D366" />
                <path
                  d="M30.72 26.0307C30.3647 25.8531 28.6293 25.004 28.3043 24.8868C27.981 24.7678 27.7447 24.7092 27.5085 25.0644C27.274 25.4143 26.5955 26.2065 26.3895 26.441C26.1834 26.6719 25.9774 26.6897 25.6257 26.5298C25.2704 26.3522 24.1301 25.9792 22.7801 24.7713C21.7286 23.8299 21.0216 22.6753 20.8138 22.3201C20.6078 21.9648 20.7907 21.7695 20.9683 21.5918C21.1282 21.432 21.3236 21.1833 21.5012 20.9701C21.6753 20.757 21.7321 20.6149 21.8529 20.384C21.9701 20.1353 21.9115 19.9399 21.8227 19.7623C21.7339 19.5847 21.027 17.8439 20.7321 17.1512C20.4479 16.4585 20.1548 16.5473 19.9363 16.5473C19.7321 16.5295 19.4958 16.5295 19.2614 16.5295C19.0233 16.5295 18.6397 16.6183 18.3164 16.9558C17.9931 17.3111 17.0801 18.1637 17.0801 19.8866C17.0801 21.6096 18.3466 23.2793 18.5224 23.5279C18.7001 23.7589 21.0163 27.3114 24.5617 28.8389C25.4072 29.1942 26.0644 29.4073 26.5795 29.585C27.425 29.8514 28.1959 29.8159 28.8052 29.7271C29.4855 29.6205 30.8976 28.8745 31.1924 28.0396C31.4944 27.2048 31.4944 26.512 31.4056 26.3522C31.3168 26.1923 31.0859 26.1035 30.7306 25.9436M24.281 34.7556H24.2633C22.1673 34.7556 20.0891 34.1872 18.2773 33.1215L17.851 32.8675L13.4104 34.022L14.6005 29.7057L14.3163 29.2617C13.144 27.3966 12.5223 25.2474 12.5223 23.0341C12.5223 16.5864 17.7977 11.3287 24.2952 11.3287C27.4392 11.3287 30.3878 12.5543 32.6081 14.7746C34.8284 16.9771 36.054 19.9257 36.054 23.0519C36.0487 29.4997 30.7732 34.7574 24.2899 34.7574M34.2991 13.0854C31.5992 10.4743 28.0467 9 24.2633 9C16.4691 9 10.1243 15.3163 10.119 23.0821C10.119 25.5635 10.7691 27.9846 12.0072 30.1232L10 37.42L17.5011 35.4626C19.5687 36.5816 21.8955 37.1749 24.2633 37.1766H24.2704C32.0681 37.1766 38.4164 30.8585 38.42 23.091C38.42 19.3307 36.951 15.7906 34.2813 13.1298"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_307_16">
                  <rect width="47" height="47" rx="23.5" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>
          <button onClick={handleShareFacebook}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="47"
              height="47"
              viewBox="0 0 47 47"
              fill="none"
            >
              <g clipPath="url(#clip0_307_13)">
                <path d="M47 0H0V47H47V0Z" fill="#3B5998" />
                <path
                  d="M25.0422 34.5156V24.4547H28.4203L28.9344 20.5625H25.0422V18.0656C25.0422 16.9641 25.3359 16.1562 26.9516 16.1562H29.0078V12.6313C28.6406 12.5578 27.3922 12.4844 25.9969 12.4844C22.9859 12.4844 20.9297 14.3203 20.9297 17.625V20.5625H17.625V24.4547H21.0031V34.5156H25.0422Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_307_13">
                  <rect width="47" height="47" rx="23.5" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default ShareButtons;
