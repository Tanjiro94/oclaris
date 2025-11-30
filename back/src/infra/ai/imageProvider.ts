export type ImageModelInput = {
    model: string;
    artDirectionId: string;
    userId: string;
    imagesCount: number;
    prompt?: string;
};

export type ImageModelResult = {
    urls: string[];
    message?: string | null;
};

export async function callImageModel(
    opts: ImageModelInput,
): Promise<ImageModelResult> {
    console.log('[IMG-MODEL] fake call', opts);

    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    const urls = Array.from({ length: opts.imagesCount }, (_, i) =>
        `https://picsum.photos/seed/${opts.artDirectionId}-${i}/1024/1536`,
    );

    return {
        urls,
        message: 'Fake generation OK',
    };
}