import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const createTextFile = publicProcedure
  .input(z.object({
    filename: z.string(),
    content: z.string(),
    format: z.enum(['txt', 'json', 'md']).optional().default('txt'),
    folder: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[FILES] Creating text file:', input.filename);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const file = {
        id: fileId,
        filename: input.filename,
        content: input.content,
        format: input.format,
        folder: input.folder || 'root',
        mimeType: input.format === 'json' ? 'application/json' : 'text/plain',
        size: new Blob([input.content]).size,
        created_at: now,
        updated_at: now,
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/${fileId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(file),
      });
      
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/files_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/files_index`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...indexArray, { 
          id: fileId, 
          filename: input.filename, 
          format: input.format,
          folder: file.folder,
          size: file.size,
          created_at: now,
        }]),
      });
      
      return { success: true, fileId, file };
    } catch (error) {
      console.error('[FILES] Failed to create file:', error);
      return { success: false, error: String(error) };
    }
  });

export const uploadFile = publicProcedure
  .input(z.object({
    filename: z.string(),
    base64Content: z.string(),
    mimeType: z.string(),
    folder: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[FILES] Uploading file:', input.filename);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const size = Math.ceil((input.base64Content.length * 3) / 4);
      
      const file = {
        id: fileId,
        filename: input.filename,
        base64Content: input.base64Content,
        mimeType: input.mimeType,
        folder: input.folder || 'uploads',
        size,
        created_at: now,
        updated_at: now,
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/${fileId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(file),
      });
      
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/files_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/files_index`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...indexArray, {
          id: fileId,
          filename: input.filename,
          mimeType: input.mimeType,
          folder: file.folder,
          size,
          created_at: now,
        }]),
      });
      
      return { success: true, fileId, file: { ...file, base64Content: undefined } };
    } catch (error) {
      console.error('[FILES] Failed to upload file:', error);
      return { success: false, error: String(error) };
    }
  });

export const uploadImage = publicProcedure
  .input(z.object({
    filename: z.string(),
    base64Image: z.string(),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']).optional().default('image/png'),
    folder: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[FILES] Uploading image:', input.filename);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const imageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const size = Math.ceil((input.base64Image.length * 3) / 4);
      
      const image = {
        id: imageId,
        filename: input.filename,
        base64Image: input.base64Image,
        mimeType: input.mimeType,
        folder: input.folder || 'images',
        tags: input.tags || [],
        size,
        created_at: now,
        updated_at: now,
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/${imageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(image),
      });
      
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/images_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/images_index`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...indexArray, {
          id: imageId,
          filename: input.filename,
          mimeType: input.mimeType,
          folder: image.folder,
          tags: image.tags,
          size,
          created_at: now,
        }]),
      });
      
      return { success: true, imageId, image: { ...image, base64Image: undefined } };
    } catch (error) {
      console.error('[FILES] Failed to upload image:', error);
      return { success: false, error: String(error) };
    }
  });

export const generateImage = publicProcedure
  .input(z.object({
    prompt: z.string(),
    size: z.enum(['1024x1024', '1024x1792', '1792x1024']).optional().default('1024x1024'),
    saveToGallery: z.boolean().optional().default(true),
    filename: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[FILES] Generating image with prompt:', input.prompt.substring(0, 50));
    
    try {
      const response = await fetch('https://toolkit.rork.com/images/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input.prompt,
          size: input.size,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (input.saveToGallery) {
        const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
        const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
        const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
        
        if (dbEndpoint && dbNamespace && dbToken) {
          const imageId = `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();
          
          const image = {
            id: imageId,
            filename: input.filename || `generated_${Date.now()}.png`,
            base64Image: result.image.base64Data,
            mimeType: result.image.mimeType,
            folder: 'generated',
            prompt: input.prompt,
            size: result.size,
            created_at: now,
          };
          
          await fetch(`${dbEndpoint}/key/${dbNamespace}/${imageId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${dbToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(image),
          });
          
          const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/images_index`, {
            headers: { 'Authorization': `Bearer ${dbToken}` },
          });
          const index = indexResponse.ok ? await indexResponse.json() : [];
          const indexArray = Array.isArray(index) ? index : [];
          
          await fetch(`${dbEndpoint}/key/${dbNamespace}/images_index`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${dbToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([...indexArray, {
              id: imageId,
              filename: image.filename,
              folder: 'generated',
              prompt: input.prompt,
              created_at: now,
            }]),
          });
          
          return {
            success: true,
            imageId,
            image: {
              base64Data: result.image.base64Data,
              mimeType: result.image.mimeType,
            },
            size: result.size,
          };
        }
      }
      
      return {
        success: true,
        image: {
          base64Data: result.image.base64Data,
          mimeType: result.image.mimeType,
        },
        size: result.size,
      };
    } catch (error) {
      console.error('[FILES] Failed to generate image:', error);
      return { success: false, error: String(error) };
    }
  });

export const listFiles = publicProcedure
  .input(z.object({
    folder: z.string().optional(),
    type: z.enum(['all', 'text', 'image', 'other']).optional().default('all'),
    limit: z.number().optional().default(50),
  }))
  .query(async ({ input }) => {
    console.log('[FILES] Listing files:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { files: [], images: [], message: 'Database not configured' };
    }
    
    try {
      const filesResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/files_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const filesIndex = filesResponse.ok ? await filesResponse.json() : [];
      
      const imagesResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/images_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const imagesIndex = imagesResponse.ok ? await imagesResponse.json() : [];
      
      let files = Array.isArray(filesIndex) ? filesIndex : [];
      let images = Array.isArray(imagesIndex) ? imagesIndex : [];
      
      if (input.folder) {
        files = files.filter((f: any) => f.folder === input.folder);
        images = images.filter((i: any) => i.folder === input.folder);
      }
      
      files = files.slice(0, input.limit);
      images = images.slice(0, input.limit);
      
      if (input.type === 'text') {
        return { files, images: [] };
      } else if (input.type === 'image') {
        return { files: [], images };
      }
      
      return { files, images };
    } catch (error) {
      console.error('[FILES] Failed to list files:', error);
      return { files: [], images: [], error: String(error) };
    }
  });

export const getFile = publicProcedure
  .input(z.object({
    fileId: z.string(),
  }))
  .query(async ({ input }) => {
    console.log('[FILES] Getting file:', input.fileId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { file: null, message: 'Database not configured' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/${input.fileId}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { file: null, message: 'File not found' };
      }
      
      const file = await response.json();
      return { file };
    } catch (error) {
      console.error('[FILES] Failed to get file:', error);
      return { file: null, error: String(error) };
    }
  });

export const deleteFile = publicProcedure
  .input(z.object({
    fileId: z.string(),
    isImage: z.boolean().optional().default(false),
  }))
  .mutation(async ({ input }) => {
    console.log('[FILES] Deleting file:', input.fileId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      await fetch(`${dbEndpoint}/key/${dbNamespace}/${input.fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const indexKey = input.isImage ? 'images_index' : 'files_index';
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/${indexKey}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      const updatedIndex = indexArray.filter((item: any) => item.id !== input.fileId);
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/${indexKey}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedIndex),
      });
      
      return { success: true };
    } catch (error) {
      console.error('[FILES] Failed to delete file:', error);
      return { success: false, error: String(error) };
    }
  });
