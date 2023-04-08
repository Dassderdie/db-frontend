export function shortenUrl(url: string) {
    return url
        .replace('/projects', '/p')
        .replace('/tables', '/t')
        .replace('/entries', '/e')
        .replace('/overview', '/o');
}
