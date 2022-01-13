import fs from 'fs'
import path from 'path'

export const moveFile = async (oldPath: string, newPath: string) => {
  // 1. Create the destination directory
  // Set the `recursive` option to `true` to create all the subdirectories
  await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
  try {
    // 2. Rename the file (move it to the new directory)
    await fs.promises.rename(oldPath, newPath);
  } catch (error: any) {
    if (error.code === 'EXDEV') {
      // 3. Copy the file as a fallback
      await fs.promises.copyFile(oldPath, newPath);
      // Remove the old file
      await fs.promises.unlink(oldPath);
    } else {
      // Throw any other error
      throw error;
    }
  }
}

export default {
    moveFile
}