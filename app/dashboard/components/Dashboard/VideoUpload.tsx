import React, { useState } from "react";
import {
    Box,
    Button,
    Input,
    Text,
    Progress,
    VStack,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useColorModeValue,
    AspectRatio,
    Flex,
} from "@chakra-ui/react";

const LIBRARY_ID = "639123";
const API_KEY = "12da0836-634b-41ca-8d014948ad70-2e9b-479c"; // ⚠️ testing only

interface VideoUploaderProps {
    initialVideoUrl?: string;
    onUploadComplete?: (url: string) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
    initialVideoUrl = "",
    onUploadComplete
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string>(initialVideoUrl);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        setError("");
        setVideoUrl("");

        if (localPreviewUrl) {
            URL.revokeObjectURL(localPreviewUrl);
            setLocalPreviewUrl("");
        }

        if (!selected) return;

        if (!selected.type.startsWith("video/")) {
            setError("Please select a valid video file");
            return;
        }

        if (selected.size > 1024 * 1024 * 1024) {
            setError("Max file size is 1GB");
            return;
        }

        setFile(selected);
        setLocalPreviewUrl(URL.createObjectURL(selected));
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file");
            return;
        }

        try {
            setLoading(true);
            setProgress(0);
            setError("");

            // 👉 Step 1: Create video
            const createRes = await fetch(
                `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
                {
                    method: "POST",
                    headers: {
                        AccessKey: API_KEY,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ title: file.name }),
                }
            );

            const createData = await createRes.json();
            const videoId = createData.guid;

            // 👉 Step 2: Upload video with progress
            const xhr = new XMLHttpRequest();

            xhr.open(
                "PUT",
                `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`
            );

            xhr.setRequestHeader("AccessKey", API_KEY);
            xhr.setRequestHeader("Content-Type", "application/octet-stream");

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    setProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const finalUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`;
                    setVideoUrl(finalUrl);
                    if (onUploadComplete) {
                        onUploadComplete(finalUrl);
                    }
                } else {
                    setError("Upload failed");
                }
                setLoading(false);
            };

            xhr.onerror = () => {
                setError("Upload error");
                setLoading(false);
            };

            xhr.send(file);
        } catch (err) {
            console.error(err);
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <Box
            maxW="600px"
            mx="auto"
            mt={10}
            p={6}
            borderWidth="1px"
            borderRadius="xl"
            boxShadow="xl"
            bg={useColorModeValue("white", "gray.800")}
        >
            <VStack spacing={6} align="stretch">
                <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="900" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                        Video Content Manager
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        Upload or replace your dashboard video content
                    </Text>
                </Box>

                <Box p={4} borderWidth="2px" borderStyle="dashed" borderRadius="lg" borderColor={file ? "blue.400" : "gray.200"}>
                    <VStack spacing={4}>
                        <Text fontWeight="bold" fontSize="sm">
                            {videoUrl ? "Replace existing video" : "Select video to upload"}
                        </Text>
                        <Input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            variant="unstyled"
                            p={1}
                        />
                        <Text fontSize="xs" color="gray.400">
                            MP4, MOV supported. Max 600MB.
                        </Text>
                    </VStack>
                </Box>

                {error && (
                    <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        {error}
                    </Alert>
                )}

                {loading && (
                    <Alert status="warning" borderRadius="md" variant="subtle">
                        <AlertIcon />
                        <Box>
                            <AlertTitle fontSize="sm">Uploading Large File...</AlertTitle>
                            <AlertDescription fontSize="xs">
                                Please do not refresh or close this tab until the upload reaches 100%.
                            </AlertDescription>
                        </Box>
                    </Alert>
                )}

                {progress > 0 && progress < 100 && (
                    <Box>
                        <Flex justify="space-between" mb={1}>
                            <Text fontSize="xs" fontWeight="bold">Upload Progress</Text>
                            <Text fontSize="xs" fontWeight="bold">{progress}%</Text>
                        </Flex>
                        <Progress value={progress} size="md" colorScheme="blue" borderRadius="full" hasStripe isAnimated />
                    </Box>
                )}

                {file && !loading && (
                    <Button
                        colorScheme="blue"
                        size="lg"
                        width="100%"
                        onClick={handleUpload}
                        leftIcon={<span>⬆️</span>}
                        boxShadow="lg"
                        _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                    >
                        Start Upload
                    </Button>
                )}

                {localPreviewUrl && !videoUrl && !loading && (
                    <Box>
                        <Text mb={2} fontWeight="bold" fontSize="sm">New Selection Preview:</Text>
                        <video
                            src={localPreviewUrl}
                            controls
                            width="100%"
                            style={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                        />
                    </Box>
                )}

                {videoUrl && (
                    <Box p={4} bg={useColorModeValue("blue.50", "whiteAlpha.100")} borderRadius="xl" border="1px solid" borderColor="blue.100">
                        <VStack spacing={4} align="stretch">
                            <Flex justify="space-between" align="center">
                                <Text fontWeight="bold" color="blue.600">
                                    {initialVideoUrl === videoUrl ? "Current Database Video" : "Newly Uploaded Video"}
                                </Text>
                                <Button
                                    size="xs"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => {
                                        navigator.clipboard.writeText(videoUrl);
                                        alert("Link copied!");
                                    }}
                                >
                                    Copy Link
                                </Button>
                            </Flex>

                            <AspectRatio ratio={16 / 9}>
                                <iframe
                                    src={videoUrl}
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    title="video"
                                    style={{ borderRadius: "16px" }}
                                />
                            </AspectRatio>

                            <Text fontSize="xs" color="gray.500" fontStyle="italic" wordBreak="break-all">
                                {videoUrl}
                            </Text>
                        </VStack>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default VideoUploader;