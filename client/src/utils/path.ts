export function parseUrl(url: string) {
  try {
    const parsed = new URL(url);
    const hostnameParts = parsed.hostname.split(".");
    const domain = hostnameParts.length >= 2 ? hostnameParts.slice(-2).join(".") : parsed.hostname;

    return {
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? "443" : "80"),
      domain,
      pathname: parsed.pathname,
      query: parsed.search,
      hash: parsed.hash,
    };
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

export const prettyPath = (path: string) => {
  return path
    .split("/")
    .filter((e) => e)
    .join("/");
};

export const pathArr = (path: string) => {
  return path.split("/").filter((e) => e);
};

export const concacPaths = (...paths: string[]): string => {
  return paths
    .reduce((acc: string[], curr: string) => {
      acc.push(prettyPath(curr));
      return acc;
    }, [])
    .filter((e) => e)
    .join("/");
};

export const comparePath = (path1: string, path2: string) => {
  if (!hasDynamicSegment(path1)) {
    return prettyPath(path1) === prettyPath(path2); // Nếu không có ":id", so sánh đường dẫn tĩnh
  }

  const dynamicSegments = path1.split("/").filter((e) => e);
  const actualSegments = path2.split("/").filter((e) => e);

  if (dynamicSegments.length !== actualSegments.length) {
    return false; // Nếu số lượng phần tử không khớp
  }

  return dynamicSegments.every((segment, index) => {
    return segment.startsWith(":") || segment === actualSegments[index];
  });
};

function hasDynamicSegment(path: string): boolean {
  const segments = path.split("/"); // Tách path thành các phần tử
  return segments.some((segment) => segment.startsWith(":")); // Kiểm tra xem có phần tử nào bắt đầu bằng ":"
}
