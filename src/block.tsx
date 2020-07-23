import * as React from "react";
import {
  DecorationType,
  BlockType,
  ContentValueType,
  BlockMapType
} from "./types";
import Asset from "./components/asset";
import Code from "./components/code";
import {
  classNames,
  getTextContent,
  getListNumber,
  toNotionImageUrl
} from "./utils";
import Audio from "./components/audio";
import File from "./components/file";
import Table from "./components/table";
import Draggable from "react-draggable";

export const renderChildText = (properties: DecorationType[]) => {
  return properties?.map(([text, decorations], i) => {
    if (!decorations) {
      return <React.Fragment key={i}>{text}</React.Fragment>;
    }

    return decorations.reduceRight((element, decorator) => {
      switch (decorator[0]) {
        case "h":
          return (
            <span key={i} className={`notion-${decorator[1]}`}>
              {element}
            </span>
          );
        case "c":
          return (
            <code key={i}>
              {element}
            </code>
          );
        case "b":
          return <b key={i}>{element}</b>;
        case "i":
          return <em key={i}>{element}</em>;
        case "s":
          return <s key={i}>{element}</s>;
        case "a":
          return (
            <a className="notion-link" href={decorator[1]} key={i}>
              {element}
            </a>
          );

        default:
          return <React.Fragment key={i}>{element}</React.Fragment>;
      }
    }, <>{text}</>);
  });
};

export type MapPageUrl = (pageId: string) => string;

interface Block {
  block: BlockType;
  level: number;
  blockMap: BlockMapType;

  fullPage?: boolean;
  mapPageUrl?: MapPageUrl;
}

export const Block: React.FC<Block> = props => {
  const { block, children, level, blockMap } = props;
  const blockValue = block?.value;
  switch (blockValue?.type) {
    case "page":
      if (level === 0) {
        if (!blockValue.properties) {
          return null;
        }

        const {
          page_cover,
          page_cover_position
        } = blockValue.format || {};

        if (page_cover) {
          const coverPosition = (1 - (page_cover_position || 0.5)) * 100;

          return (
            <div className="notion">
              {page_cover && (
                <div className="notion-cover">
                  <img
                    src={toNotionImageUrl(page_cover)}
                    alt={getTextContent(blockValue.properties.title)}
                    className="notion-page-cover"
                    style={{
                      objectPosition: `center ${coverPosition}%`
                    }}
                  />
                </div>
              )}
              {children}
            </div>
          );
        } else {
          return <div className="notion">{children}</div>;
        }
      } else {
        if (!blockValue.properties) return null;
        return (
          <p className="page-link">
            <a href={props.mapPageUrl?.(blockValue.id) || `/${blockValue.id}`}>
              {renderChildText(blockValue.properties.title)} <span className="arrow">→</span>
            </a>
          </p>
        );
      }
    case "header":
      if (!blockValue.properties) return null;
      return (
        <h1 className="notion-h1" data-sal="fade">
          {renderChildText(blockValue.properties.title)}
        </h1>
      );
    case "sub_header":
      if (!blockValue.properties) return null;
      return (
        <h2 className="notion-h2" data-sal="fade">
          {renderChildText(blockValue.properties.title)}
        </h2>
      );
    case "sub_sub_header":
      if (!blockValue.properties) return null;
      return (
        <h3 className="notion-h3">
          {renderChildText(blockValue.properties.title)}
        </h3>
      );
    case "divider":
      return <hr className="notion-hr" />;
    case "text":
      if (!blockValue.properties) {
        return <div className="notion-blank" />;
      }
      const blockColor = blockValue.format?.block_color;
      return (
        <p
          className={classNames(
            `notion-text`,
            blockColor && `notion-${blockColor}`
          )}
        >
          {renderChildText(blockValue.properties.title)}
        </p>
      );
    case "bulleted_list":
    case "numbered_list":
      const wrapList = (content: React.ReactNode, start?: number) =>
        blockValue.type === "bulleted_list" ? (
          <ul className="notion-list notion-list-disc">{content}</ul>
        ) : (
            <ol start={start} className="notion-list notion-list-numbered">
              {content}
            </ol>
          );

      let output: JSX.Element | null = null;

      if (blockValue.content) {
        output = (
          <>
            {blockValue.properties && (
              <li>{renderChildText(blockValue.properties.title)}</li>
            )}
            {wrapList(children)}
          </>
        );
      } else {
        output = blockValue.properties ? (
          <li>{renderChildText(blockValue.properties.title)}</li>
        ) : null;
      }

      const isTopLevel =
        block.value.type !== blockMap[block.value.parent_id].value.type;
      const start = getListNumber(blockValue.id, blockMap);

      return isTopLevel ? wrapList(output, start) : output;

    case "image":
    case "embed":
    case "video":
      const value = block.value as ContentValueType;

      return (
        <figure
          className={`notion-asset-wrapper ${(value.format.block_aspect_ratio && blockValue.type == "image" ? "notion-asset-inline" : "")}`}
          style={{ width: `${(value.format.block_width / 708 * (value.format.block_aspect_ratio && blockValue.type == "image" ? 50 : 100))}%` }}
        >
          <Asset block={block} />
          {value.properties.caption && (
            <figcaption className="notion-image-caption">
              {renderChildText(value.properties.caption)}
            </figcaption>
          )}
        </figure>
      );
    case "code": {
      if (blockValue.properties.title) {
        const content = blockValue.properties.title[0][0];
        const language = blockValue.properties.language[0][0];
        return (
          <Code key={blockValue.id} language={language || ""} code={content} />
        );
      }
      break;
    }
    case "column_list":
      return <div className="notion-row">{children}</div>;
    case "column":
      const spacerWith = 46;
      const ratio = blockValue.format.column_ratio;
      const columns = Number((1 / ratio).toFixed(0));
      const spacerTotalWith = (columns - 1) * spacerWith;
      const width = `calc((100% - ${spacerTotalWith}px) * ${ratio})`;
      return (
        <>
          <div className="notion-column" style={{ width }}>
            {children}
          </div>
          <div className="notion-spacer" style={{ width: spacerWith }} />
        </>
      );
    case "quote":
      if (!blockValue.properties) return null;
      return (
        <blockquote className="notion-quote">
          {renderChildText(blockValue.properties.title)}
        </blockquote>
      );
    case "callout":
      return (
        <Draggable>
          <div
            className={classNames(
              "notion-callout",
              blockValue.format.block_color &&
              `notion-${blockValue.format.block_color}_co`
            )}
          >
            {renderChildText(blockValue.properties.title)}
          </div>
        </Draggable>
      );
    case "bookmark":
      return (
        <div className="notion-row">
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={classNames(
              "notion-bookmark",
              blockValue.format.block_color &&
              `notion-${blockValue.format.block_color}`
            )}
            href={blockValue.properties.link[0][0]}
          >
            <div>
              <div className="notion-bookmark-title">
                {renderChildText(blockValue.properties.title)}
              </div>
              <div className="notion-bookmark-description">
                {renderChildText(blockValue.properties.description)}
              </div>
              <div className="notion-bookmark-link">
                <img
                  src={blockValue.format.bookmark_icon}
                  alt={getTextContent(blockValue.properties.title)}
                />
                <div>{renderChildText(blockValue.properties.link)}</div>
              </div>
            </div>
            <div className="notion-bookmark-image">
              <img
                src={blockValue.format.bookmark_cover}
                alt={getTextContent(blockValue.properties.title)}
              />
            </div>
          </a>
        </div>
      );
    case "toggle":
      return (
        <details className="notion-toggle">
          <summary>{renderChildText(blockValue.properties.title)}</summary>
          <div>{children}</div>
        </details>
      );
    case "miro": {
      const value = block.value as ContentValueType;
      const embedId = value.properties.source[0][0].replace("https://miro.com/app/board/", "");
      const embedUrl = "https://miro.com/app/embed/" + embedId + "/?autoplay=yep";
      return (
        <div className="notion-miro-embed">
          <iframe src={embedUrl} frameBorder={"0"} scrolling={"auto"} allowFullScreen style={{ height: value.format.block_height }}></iframe>
        </div>
      );
    }
    case "audio": {
      const value = block.value as ContentValueType;
      const source = encodeURIComponent(value.properties.source[0][0]);

      return (
        <Audio
          id={blockValue.id}
          url={source}
        />
      );
    }
    case "collection_view": {
      return (
        <Table id={blockValue.id} />
      );
    }
    case "file": {
      const value = block.value as ContentValueType;
      const source = encodeURIComponent(value.properties.source[0][0]);
      const title = blockValue.properties.title[0][0];
      const size = blockValue.properties.size[0][0];

      return (
        <File
          id={blockValue.id}
          url={source}
          title={title}
          size={size}
        />
      )
    }
    default:
      if (process.env.NODE_ENV !== "production") {
        console.log("Unsupported type " + block?.value?.type);
      }
      return <div />;
  }
  return null;
};
