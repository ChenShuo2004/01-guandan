from __future__ import annotations

import argparse
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from gradio_client import Client, handle_file


ROOT = Path(__file__).resolve().parents[1]
VOICE_ROOT = ROOT / "public" / "assets" / "audio" / "game" / "voice"
DEFAULT_CLONE_URL = "http://192.168.2.88:7860"
DEFAULT_FFMPEG = Path(
    r"C:\Users\Administrator\AppData\Local\自动化视频No.1\current\Tools\ffmpeg\win-x64\ffmpeg.exe"
)


@dataclass(frozen=True)
class VoiceRole:
    folder: str
    reference: Path


RANKS = [
    ("3", "3"),
    ("4", "4"),
    ("5", "5"),
    ("6", "6"),
    ("7", "7"),
    ("8", "8"),
    ("9", "9"),
    ("10", "10"),
    ("j", "勾"),
    ("q", "圈"),
    ("k", "老K"),
    ("a", "尖"),
    ("2", "2"),
    ("sj", "小王"),
    ("bj", "大王"),
]

TRIPLE_RANKS = RANKS[:13]
BOMB_RANKS = RANKS[:13]


def build_assets() -> list[tuple[str, str]]:
    assets: list[tuple[str, str]] = [("pass", "不出")]

    for key, text in RANKS:
        assets.append((f"single-{key}", f"单张{text}"))

    for key, text in RANKS:
        assets.append((f"pair-{key}", f"对{text}"))

    for key, text in TRIPLE_RANKS:
        assets.append((f"triple-{key}", f"三个{text}"))

    for key, text in BOMB_RANKS:
        assets.append((f"bomb-{key}", f"{text}炸"))

    assets.extend(
        [
            ("four-jokers", "四王炸"),
            ("straight", "顺子"),
            ("straight-flush", "同花顺"),
            ("triple-with-pair", "三带二"),
        ]
    )
    return assets


def build_roles() -> list[VoiceRole]:
    role0 = VOICE_ROOT / "role-0" / "play.mp3"
    return [
        VoiceRole("user", role0),
        VoiceRole("role-0", role0),
        VoiceRole("role-1", VOICE_ROOT / "role-1" / "play.mp3"),
        VoiceRole("role-2", VOICE_ROOT / "role-2" / "play.mp3"),
    ]


def generate_wav(client: Client, clone_url: str, reference: Path, text: str, wav_path: Path) -> None:
    result = client.predict(
        "与参考音频的音色相同",
        handle_file(str(reference)),
        text,
        handle_file(str(reference)),
        0.65,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        "",
        False,
        120,
        True,
        0.8,
        30,
        0.8,
        0.0,
        3,
        10.0,
        1500,
        api_name="/gen_single",
    )
    source = result[0] if isinstance(result, (list, tuple)) else result
    if isinstance(source, dict):
        source = source.get("path") or source.get("value")
    if not source:
        raise RuntimeError(f"{clone_url} returned no audio path: {result!r}")
    shutil.copyfile(source, wav_path)


def convert_to_mp3(ffmpeg: Path, wav_path: Path, mp3_path: Path, volume: float) -> None:
    mp3_path.parent.mkdir(parents=True, exist_ok=True)
    filter_chain = f"volume={volume},acompressor=threshold=-18dB:ratio=2.5:attack=5:release=60,alimiter=limit=0.96"
    subprocess.run(
        [
            str(ffmpeg),
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(wav_path),
            "-af",
            filter_chain,
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "128k",
            str(mp3_path),
        ],
        check=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Guandan play voice assets with a local voice clone service.")
    parser.add_argument("--clone-url", default=DEFAULT_CLONE_URL)
    parser.add_argument("--ffmpeg", type=Path, default=DEFAULT_FFMPEG)
    parser.add_argument("--volume", type=float, default=2.2)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--only", help="Generate only one asset key, for example pair-a.")
    args = parser.parse_args()

    if not args.ffmpeg.exists():
        raise FileNotFoundError(f"ffmpeg not found: {args.ffmpeg}")

    assets = build_assets()
    if args.only:
        assets = [asset for asset in assets if asset[0] == args.only]
        if not assets:
            raise ValueError(f"Unknown asset key: {args.only}")

    roles = build_roles()
    for role in roles:
        if not role.reference.exists():
            raise FileNotFoundError(f"Reference audio not found for {role.folder}: {role.reference}")

    client = Client(args.clone_url)
    with tempfile.TemporaryDirectory(prefix="guandan-voice-") as tmp_dir_name:
        tmp_dir = Path(tmp_dir_name)
        total = len(roles) * len(assets)
        index = 0
        for role in roles:
            for key, text in assets:
                index += 1
                target = VOICE_ROOT / role.folder / "plays" / f"{key}.mp3"
                if target.exists() and not args.force:
                    print(f"[{index}/{total}] skip {target}")
                    continue

                wav_path = tmp_dir / f"{role.folder}-{key}.wav"
                print(f"[{index}/{total}] generate {role.folder}/{key}: {text}")
                generate_wav(client, args.clone_url, role.reference, text, wav_path)
                convert_to_mp3(args.ffmpeg, wav_path, target, args.volume)


if __name__ == "__main__":
    main()
