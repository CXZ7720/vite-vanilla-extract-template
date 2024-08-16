import { createLazyFileRoute } from "@tanstack/react-router";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Dropzone, DropzoneProps, FileWithPath } from "@mantine/dropzone";
import { IconUpload, IconVideo, IconX } from "@tabler/icons-react";
import { Button, Flex, Group, rem, Text, Title } from "@mantine/core";
import { useState, useRef, useEffect } from "react";

export const Route = createLazyFileRoute("/convert")({
  component: () => <Converter />,
});

const Converter = (props: Partial<DropzoneProps>) => {

  const [originalVideo, setOriginalVideo] = useState<FileWithPath>();
  const [videoInput, setVideoInput] = useState<string>();
  const [convertedVideoBlob, setConvertedVideoBlob] = useState<Blob>();
  const [convertedVideoInput, setConvertedVideoInput] = useState<string>();

  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
    // Listen to progress event instead of log.
    ffmpeg.on("progress", ({ progress, time }) => {
      if (messageRef.current) {
        messageRef.current.innerHTML = `${progress * 100} % (transcoded time: ${time / 1000000} s)`;
      }
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });

    console.log("FFmpeg is ready");
  };

  useEffect(() => {
    load();
  }, []);

  const transcode = async () => {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile(originalVideo?.name ?? '', await fetchFile(videoInput));
    await ffmpeg.exec(["-i", originalVideo?.name ?? '', "output.mp4"]);
    const fileData = await ffmpeg.readFile("output.mp4");
    const data = new Uint8Array(fileData as ArrayBuffer);
    const blob = new Blob([data], { type: "video/mp4" });
    setConvertedVideoBlob(blob);

    const url = URL.createObjectURL(blob);
    setConvertedVideoInput(url);
  };

  return (
    <>
      <Dropzone
        onDrop={(files) => {
          console.log(files);
          setOriginalVideo(files[0]);
          setVideoInput(URL.createObjectURL(files[0]));
        }}
        onReject={(files) => console.log("rejected files", files)}
        accept={["video/*"]}
        {...props}
      >
        <Group
          justify="center"
          gap="xl"
          mih={220}
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-blue-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-red-6)",
              }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconVideo
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-dimmed)",
              }}
              stroke={1.5}
            />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag Videos here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Attach as many files as you like, each file should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>
      <Flex direction="row" align="center" gap="md" justify="center">
        {videoInput && (
          <>
            <Button onClick={() => transcode()}>변환 시작</Button>
            <Button onClick={() => setVideoInput(undefined)}>
              업로드된 파일 지우기
            </Button>
          </>
        )}
      </Flex>
      <Flex direction="column" gap="md" mt="md">
        {videoInput && originalVideo && (
          <>
            <Title order={2}>원본 파일</Title>
            <Text>
              File Size : {originalVideo.size} bytes ( {(originalVideo.size / (1024 * 1024)).toFixed(2)} MB )
            </Text>
            <Text>
              File Type : {originalVideo.type} .({originalVideo.name.split('.')[1]})
            </Text>

            <video src={videoInput} controls style={{ maxWidth: "100%" }} />
          </>
        )}
      </Flex>
      <Text ref={messageRef} />
      <Flex direction="column" gap="md" mt="md">
        {convertedVideoInput && convertedVideoBlob &&  (
          <>
            <Title order={2}>변환된 파일</Title>
            <Text>
              File Size : {convertedVideoBlob.size} bytes ( {(convertedVideoBlob.size / (1024 * 1024)).toFixed(2)} MB )
            </Text>
            <Text>
              File Type : {convertedVideoBlob.type} .({convertedVideoBlob.type.split('/')[1]})
            </Text>

            <video
              src={convertedVideoInput}
              controls
              style={{ maxWidth: "100%" }}
            />
          </>
        )}
      </Flex>
    </>
  );
};
