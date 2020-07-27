import * as React from "react";
import { BlockType, ContentValueType } from "../types";
import { toNotionImageUrl } from "../utils";
import Player from "./player";

const types = ["video", "image", "embed"];

const Asset: React.FC<{ block: BlockType }> = ({ block }) => {
  const value = block.value as ContentValueType;
  const type = block.value.type;

  if (!types.includes(type)) {
    return null;
  }

  const format = value.format;
  const {
    display_source,
    block_aspect_ratio,
    block_height,
    block_width
  } = format;

  const aspectRatio = block_aspect_ratio || block_height / block_width;

  if (type === "embed" || type === "video") {
    if (display_source.endsWith(".mp4") || display_source.endsWith(".m4v")) {
      return (
        <div className="w-full">
          <Player
            id={value.id}
            url={encodeURIComponent(display_source)}
          />
        </div>
      );
    } else {
      return (
        <div className="w-full">
          <div
            style={{
              paddingBottom: `${aspectRatio * 100}%`,
              position: "relative"
            }}
          >
            <iframe className="notion-image-inset" src={display_source} />
          </div>
        </div>
      );
    }
  }

  const src = toNotionImageUrl(value.properties.source[0][0]);

  if (type === "image") {
    const caption = value.properties.caption?.[0][0];
    if (block_aspect_ratio) {
      return (
        <img className="notion-image-inline" alt={caption} src={src} />
      );
    } else {
      return <img alt={caption} src={src} />;
    }
  }

  return null;
};

export default Asset;
