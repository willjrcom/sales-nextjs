export const getWhitelist = (): Set<string> => {
    const raw =
        process.env.WHITE_LIST ??
        process.env.NEXT_PUBLIC_WHITE_LIST ??
        "";

    if (!raw) {
        return new Set();
    }

    return new Set(
        raw
            .split(/[\n,;]/)
            .map((entry) => entry.trim().toLowerCase())
            .filter(Boolean)
    );
};
