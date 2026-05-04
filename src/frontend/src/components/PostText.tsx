import { Link } from "@tanstack/react-router";

// Common TLDs for bare domain matching
const TLDS =
  "com|org|net|io|ai|dev|app|co|me|info|biz|xyz|tech|online|site|" +
  "store|cloud|design|page|link|world|live|pro|space|fun|blog|shop|" +
  "gg|tv|fm|so|to|cc|ly|sh|is|it|de|uk|ca|au|fr|jp|kr|br|in|ru|nl|" +
  "se|no|fi|ch|at|be|pl|cz|pt|es|mx|ar|cl|za|nz|sg|hk|tw|ph|id|th|" +
  "vn|my|edu|gov|mil|int";

const BARE_DOMAIN = `[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.(?:${TLDS})(?:[/][^\\s<>"')\\]]*)?`;

const TOKEN_SPLIT = new RegExp(
  `(#[a-zA-Z]\\w*|@[a-zA-Z0-9_]{3,20}|https?://[^\\s<>"')\\]]+|${BARE_DOMAIN})`,
  "gi",
);
const HASHTAG_TEST = /^#[a-zA-Z]\w*$/;
const MENTION_TEST = /^@[a-zA-Z0-9_]{3,20}$/;
const URL_TEST = /^https?:\/\//;
const BARE_DOMAIN_TEST = new RegExp(`^${BARE_DOMAIN}$`, "i");

// Strip trailing punctuation that's likely not part of the URL
function cleanUrl(url: string): string {
  return url.replace(/[.,;:!?)]+$/, "");
}

interface PostTextProps {
  text: string;
  className?: string;
}

export function PostText({ text, className }: PostTextProps) {
  const parts = text.split(TOKEN_SPLIT);

  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (HASHTAG_TEST.test(part)) {
          return (
            <Link
              // biome-ignore lint/suspicious/noArrayIndexKey: stable list
              key={i}
              to="/hashtag/$tag"
              params={{ tag: part.slice(1) }}
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        if (MENTION_TEST.test(part)) {
          return (
            <Link
              // biome-ignore lint/suspicious/noArrayIndexKey: stable list
              key={i}
              to="/$username"
              params={{ username: part.slice(1) }}
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        if (URL_TEST.test(part)) {
          const href = cleanUrl(part);
          const trailing = part.slice(href.length);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable list
            <span key={i}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {href}
              </a>
              {trailing}
            </span>
          );
        }
        if (BARE_DOMAIN_TEST.test(part)) {
          const cleaned = cleanUrl(part);
          const trailing = part.slice(cleaned.length);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable list
            <span key={i}>
              <a
                href={`https://${cleaned}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {cleaned}
              </a>
              {trailing}
            </span>
          );
        }
        return part;
      })}
    </p>
  );
}
