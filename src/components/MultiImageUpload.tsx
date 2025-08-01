import React, { useState, useEffect } from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { Box, IconButton, Modal, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import * as BrowserImageResizer from 'browser-image-resizer';

// --- Styled Components ---

const Container = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  padding: theme.spacing(1),
  width: '100%',
  border: `1px solid #BBBBBB`,
  transition: 'border-color 0.2s',
  marginTop: 8,
}));

const InitialUploadBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const ImagePreviewBox = styled(Box)({
  position: 'relative',
  width: 150,
  height: 150,
  margin: '8px',
  borderRadius: '8px',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const DeleteButton = styled(IconButton)({
  position: 'absolute',
  top: 4,
  right: 4,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  padding: '4px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

const AddMoreButtonBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: 150,
  height: 150,
  margin: '8px',
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: '8px',
  cursor: 'pointer',
  textAlign: 'center',
  color: theme.palette.text.secondary,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
}));

const ModalBoxSx = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90vw',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  outline: 'none',
  borderRadius: '8px',
};

const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

// --- Component Props ---
interface MultiImageUploadProps {
  label?: string;
  addPhotoText?: string;
  maxImages?: number;
  onImagesChange?: (files: File[], base64s: string[]) => void;
  initialImages?: string[];
  minHeight?: string;
}

// --- Main Component ---
const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  label,
  addPhotoText = 'แนบสลิป',
  maxImages = 5,
  onImagesChange,
  initialImages = [],
  minHeight,
}) => {
  const [images, setImages] = useState<ImageListType>([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalImage, setModalImage] = useState<string | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initialImages.length > 0 && !isInitialized) {
      const loadInitialImages = async () => {
        const imagePromises = initialImages.map(async (base64, index) => {
          const file = await dataUrlToFile(base64, `initial-image-${index}.jpg`);
          return { dataURL: base64, file: file };
        });
        const loadedImages = await Promise.all(imagePromises);
        setImages(loadedImages.slice(0, maxImages)); // Ensure initial images do not exceed maxImages
      };
      loadInitialImages();
      setIsInitialized(true);
    }
  }, [initialImages, isInitialized, maxImages]);

  const imageResizeConfig = {
    quality: 0.85,
    maxWidth: 1920,
    maxHeight: 1920,
    autoRotate: true,
    debug: false,
    mimeType: 'image/jpeg',
  };

  const onChange = async (
    newImageList: ImageListType,
    addUpdateIndex?: number[]
  ) => {
    let processedImageList = [...newImageList];
    if (addUpdateIndex) {
      const resizePromises = addUpdateIndex.map(async (index) => {
        const imageToProcess = newImageList[index];
        if (imageToProcess.file && imageToProcess.file.size > 2048 * 2048) {
          try {
            const resizedBlob = await BrowserImageResizer.readAndCompressImage(
              imageToProcess.file,
              imageResizeConfig
            );
            const resizedFile = new File([resizedBlob], imageToProcess.file.name, {
              type: imageResizeConfig.mimeType,
              lastModified: Date.now(),
            });
            const dataURL = URL.createObjectURL(resizedFile);
            processedImageList[index] = { ...imageToProcess, file: resizedFile, dataURL };
          } catch (error) {
            console.error('Error resizing image:', error);
          }
        }
      });
      await Promise.all(resizePromises);
    }
    setImages(processedImageList);
    if (onImagesChange) {
      const files = processedImageList.map((img) => img.file as File).filter(Boolean);
      const base64s = processedImageList.map((img) => img.dataURL as string).filter(Boolean);
      onImagesChange(files, base64s);
    }
  };

  const handleImageClick = (imageUrl: string | undefined) => {
    setModalImage(imageUrl);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalImage(undefined);
  };

  return (
    <Box>
      {label && (
        <Typography variant="body1" sx={{ color: 'text.primary', mb: -0.5 }}>
          {label}
        </Typography>
      )}

      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxImages}
        acceptType={['jpg', 'gif', 'png', 'jpeg']}
      >
        {({
          imageList,
          onImageUpload,
          onImageRemove,
          isDragging,
          dragProps,
          errors,
        }) => (
          <Box>
            <Container
              {...dragProps}
              elevation={0}
              sx={{
                borderColor: isDragging ? 'primary.main' : '#BBBBBB',
                ...(imageList.length === 0 && { // Make the whole box clickable when empty
                    cursor: 'pointer'
                }),
                minHeight: minHeight || '150px',
              }}
              // Make the whole box clickable only when it's empty
              onClick={imageList.length === 0 ? onImageUpload : undefined}
            >
              {imageList.length === 0 ? (
                <InitialUploadBox sx={{minHeight: minHeight || '150px' }}>
                  <AddPhotoAlternateIcon sx={{ fontSize: 40 }} />
                  <Typography sx={{ fontSize: 14 }}>{addPhotoText}</Typography>
                </InitialUploadBox>
              ) : (
                <>
                  {imageList.map((image, index) => (
                    // *** START OF THE MAIN CHANGE ***
                    <ImagePreviewBox
                      key={index}
                      sx={{
                        // ถ้า maxImages คือ 1, ให้ปรับสไตล์เป็นแบบเต็มความกว้าง
                        ...(maxImages === 1 && {
                          width: '100%',
                          height: minHeight, // กำหนดความสูงที่เหมาะสม
                          margin: 0,       // ลบ margin เพื่อให้เต็มกรอบ
                        }),
                      }}
                    >
                      <img
                        src={image.dataURL}
                        alt="preview"
                        onClick={() => handleImageClick(image.dataURL)}
                        style={{ cursor: 'pointer' }}
                      />
                      <DeleteButton size="small" onClick={() => onImageRemove(index)}>
                        <CloseIcon fontSize="inherit" />
                      </DeleteButton>
                    </ImagePreviewBox>
                     // *** END OF THE MAIN CHANGE ***
                  ))}
                  {imageList.length < maxImages && (
                    <AddMoreButtonBox onClick={onImageUpload}>
                      <AddPhotoAlternateIcon sx={{ fontSize: 40 }} />
                    </AddMoreButtonBox>
                  )}
                </>
              )}
            </Container>

            {errors && (
              <Box sx={{ color: 'error.main', mt: 1 }}>
                {errors.maxNumber && (
                  <span>เลือกรูปภาพได้สูงสุด {maxImages} ภาพ</span>
                )}
                {errors.acceptType && <span>ไฟล์ประเภทนี้ไม่ได้รับอนุญาต</span>}
              </Box>
            )}
          </Box>
        )}
      </ImageUploading>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={ModalBoxSx}>
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.500', zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>
          {modalImage && (
            <img
              src={modalImage}
              alt="modal-view"
              style={{ width: '100%', height: 'auto', maxHeight: '85vh', objectFit: 'contain' }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default MultiImageUpload;