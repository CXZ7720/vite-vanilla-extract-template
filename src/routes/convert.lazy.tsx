import { createLazyFileRoute } from "@tanstack/react-router";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Dropzone, DropzoneProps, FileWithPath } from "@mantine/dropzone";
import {
  IconChevronDown,
  IconChevronUp,
  IconUpload,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import {
  Button,
  NumberFormatter,
  Flex,
  Group,
  rem,
  Text,
  Title,
  Collapse,
  Code,
  Progress,
  Select,
  Slider,
  Paper,
  Radio,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";

export const Route = createLazyFileRoute("/convert")({
  component: () => <Converter />,
});

const Converter = (props: Partial<DropzoneProps>) => {
  const [opened, { open, close }] = useDisclosure(true);
  const [startDisabled, setStartDisabled] = useState(false);

  const [encoder, setEncoder] = useState<string>("libx264");
  const [originalVideo, setOriginalVideo] = useState<FileWithPath>();
  const [videoInput, setVideoInput] = useState<string>();
  const [convertedVideoBlob, setConvertedVideoBlob] = useState<Blob>();
  const [convertedVideoInput, setConvertedVideoInput] = useState<string>();
  const [progress, setProgress] = useState<number>(0);
  const [spentTime, setSpentTime] = useState<number>(0);
  const [preset, setPreset] = useState<string | null>("ultrafast");
  const [quality, setQuality] = useState<number>(18);
  const [resolution, setResolution] = useState<{
    input: { width: number; height: number };
    output: { width: number; height: number };
  }>({
    input: { width: 0, height: 0 },
    output: { width: 0, height: 0 },
  });

  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (videoInput) {
        URL.revokeObjectURL(videoInput);
      }
      if (convertedVideoInput) {
        URL.revokeObjectURL(convertedVideoInput);
      }
    };
  }, [convertedVideoInput, videoInput]);

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
    // Listen to progress event instead of log.
    ffmpeg.on("progress", ({ progress, time }) => {
      setProgress(progress * 100);
      setSpentTime(time / 1000000);
    });

    ffmpeg.on("log", (message) => {
      console.log(message.message);
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

  const transcode = async () => {
    setStartDisabled(true);
    close();
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile(
      originalVideo?.name ?? "",
      await fetchFile(videoInput)
    );
    await ffmpeg.exec([
      "-i",
      originalVideo?.name ?? "",
      "-c:v",
      encoder,
      "-crf",
      quality.toString() ?? "18",
      "-preset",
      preset ?? "ultrafast",
      "-c:a",
      "copy",
      "-vf",
      "scale=-1:720",
      "output.mp4",
    ]);
    const fileData = await ffmpeg.readFile("output.mp4");
    const data = new Uint8Array(fileData as ArrayBuffer);
    const blob = new Blob([data], { type: "video/mp4" });
    setConvertedVideoBlob(blob);

    const outvideo = document.createElement("video");
    outvideo.preload = "metadata";
    outvideo.onloadedmetadata = function () {
      setResolution((prev) => ({
        ...prev,
        output: {
          width: outvideo.videoWidth,
          height: outvideo.videoHeight,
        },
      }));
    };

    const url = URL.createObjectURL(blob);
    outvideo.src = url;
    setConvertedVideoInput(url);
  };

  return (
    <>
      <Dropzone
        onDrop={(files) => {
          const video = document.createElement("video");
          video.preload = "metadata";

          video.onloadedmetadata = function () {
            setResolution((prev) => ({
              ...prev,
              input: {
                width: video.videoWidth,
                height: video.videoHeight,
              },
            }));
          };

          const url = URL.createObjectURL(files[0]);
          video.src = url;
          setOriginalVideo(files[0]);
          setVideoInput(url);
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
            <Button onClick={() => transcode()} disabled={startDisabled}>
              변환 시작
            </Button>
            <Button
              onClick={() => {
                setVideoInput(undefined);
                setOriginalVideo(undefined);
                setConvertedVideoBlob(undefined);
                setConvertedVideoInput(undefined);
                setProgress(0);
                setStartDisabled(false);
              }}
            >
              업로드된 파일 지우기
            </Button>
          </>
        )}
      </Flex>

      <Paper my="md" shadow="xs" p={30}>
        <Select
          label="변환 프리셋"
          placeholder="프리셋 선택"
          defaultValue={"ultrafast"}
          data={[
            "ultrafast",
            "superfast",
            "veryfast",
            "faster",
            "fast",
            "medium",
            "slow",
            "slower",
          ]}
          onChange={(value) => {
            setPreset(value);
          }}
        />

        <Text mt="xl" mb="xs">인코더 선택</Text>
        <Group>
          <Radio  checked={encoder === 'libx264'} label="x264" onChange={() => setEncoder("libx264")} />
          <Radio  checked={encoder === 'libx265'} label="x265 (Unstable)" onChange={() => setEncoder("libx265")} />
        </Group>

        <Text mt="xl">렌더링 품질 조정</Text>
        <Slider
          min={1}
          max={51}
          step={1}
          defaultValue={18}
          color="blue"
          onChangeEnd={(value) => setQuality(value)}
          label={(value) => value}
          marks={[
            {
              value: 1,
              label: (
                <Flex
                  style={{
                    textAlign: "center",
                  }}
                >
                  품질우선
                  <br />
                  (느림, 고품질)
                </Flex>
              ),
            },
            { value: 18, label: "기본값(권장)" },
            {
              value: 51,
              label: (
                <Flex
                  style={{
                    textAlign: "center",
                  }}
                >
                  속도우선
                  <br />
                  (빠름, 저품질)
                </Flex>
              ),
            },
          ]}
        />
      </Paper>
      <Flex direction="column" gap="md" mt="md" mb="md">
        {videoInput && originalVideo && (
          <>
            <Flex direction={"row"} align={"center"} justify={"space-between"}>
              <Title order={2}>원본 파일 </Title>
              {opened ? (
                <IconChevronUp size={32} cursor={"pointer"} onClick={close} />
              ) : (
                <IconChevronDown size={32} cursor={"pointer"} onClick={open} />
              )}
            </Flex>
            <Text>
              File Size :{" "}
              <NumberFormatter thousandSeparator>
                {originalVideo.size}
              </NumberFormatter>{" "}
              bytes ( {(originalVideo.size / (1024 * 1024)).toFixed(2)} MB )
            </Text>
            <Text>
              File Type : {originalVideo.type} (.
              {originalVideo.name.split(".")[1]})
            </Text>
            <Text>
              Resoultion(W x H) : {resolution.input.width}x
              {resolution.input.height}
            </Text>

            <Collapse
              in={opened}
              transitionDuration={300}
              transitionTimingFunction="linear"
            >
              <video src={videoInput} controls style={{ maxWidth: "100%" }} />
            </Collapse>
          </>
        )}
      </Flex>
      <Progress.Root size={20}>
        <Progress.Section value={progress} color="cyan">
          <Progress.Label>변환중.. ({progress.toFixed(2)}%)</Progress.Label>
        </Progress.Section>
      </Progress.Root>
      <Code block my="md">
        // 사용한 ffmpeg 커맨드
        <br />
        ffmpeg -i {originalVideo?.name ?? ""} -c:v {encoder} -crf {quality} <br />
        -preset {preset} -c:a copy -vf scale=-1:720 output.mp4
      </Code>
      <Flex direction="column" gap="md" mt="md">
        {convertedVideoInput && convertedVideoBlob && (
          <>
            <Title order={2}>변환된 파일</Title>
            <Text>
              File Size : {convertedVideoBlob.size} bytes ({" "}
              {(convertedVideoBlob.size / (1024 * 1024)).toFixed(2)} MB )
            </Text>
            <Text>
              File Type : {convertedVideoBlob.type} (.
              {convertedVideoBlob.type.split("/")[1]})
            </Text>
            <Text>
              Resoultion(W x H) : {resolution.output.width}x
              {resolution.output.height}
            </Text>
            <Text>Spent Time : {spentTime.toFixed(2)} sec</Text>

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
