export async function preloadDecode(src: string): Promise<void> {
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    if ((img as any).decode) {
      await img.decode();
      return;
    }
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("image failed"));
    });
  } catch {
    // swallow; we'll still attempt to swap
  }
}
