from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "content" / "guandan-system"
DATA_DIR = ROOT / "data" / "guandan"
PUBLIC_DIR = ROOT / "public" / "assets" / "guandan"

CATEGORY_DIR = {
    "\u57fa\u7840\u5165\u95e8": "basic",
    "\u8fdb\u9636\u6280\u5de7": "advanced",
    "\u9ad8\u624b\u4f53\u7cfb": "expert",
    "\u6b8b\u5c40\u8bad\u7ec3": "endgame",
}

CATEGORY_DESCRIPTION = {
    "\u57fa\u7840\u5165\u95e8": "\u4ece\u89c4\u5219\u3001\u80dc\u8d1f\u3001\u724c\u578b\u3001\u5934\u6e38\u5230\u724c\u529b\u4e0e\u4e3b\u653b\u52a9\u653b\uff0c\u5efa\u7acb\u53ef\u8bad\u7ec3\u7684\u57fa\u7840\u5224\u65ad\u3002",
    "\u8fdb\u9636\u6280\u5de7": "\u8bad\u7ec3\u5f31\u8def\u5904\u7406\u3001\u5c3e\u724c\u3001\u51fa\u70b8\u3001\u4f18\u5316\u624b\u6570\u548c\u52a9\u653b\u914d\u5408\u7b49\u6838\u5fc3\u80dc\u7387\u6280\u5de7\u3002",
    "\u9ad8\u624b\u4f53\u7cfb": "\u4ece\u8fdb\u8d21\u8fd8\u8d21\u3001\u8bb0\u724c\u3001\u6865\u724c\u3001\u610f\u56fe\u963b\u65ad\u5230\u4fe1\u606f\u6536\u653e\u548c\u5fc3\u7406\u7b56\u7565\uff0c\u6253\u78e8\u9ad8\u9636\u724c\u5c40\u5fc3\u667a\u3002",
    "\u6b8b\u5c40\u8bad\u7ec3": "\u628a PDF \u4e2d\u7684\u5c3e\u724c\u3001\u70b8\u5f39\u3001\u4f595-10\u5f20\u548c\u7efc\u5408\u6b8b\u5c40\u8f6c\u6210\u53ef\u91cd\u590d\u7ec3\u4e60\u7684\u51b3\u7b56\u9898\u3002",
}

DIFFICULTY = {
    "\u7b80\u5355": "\u521d\u7ea7",
    "\u4e2d\u7b49": "\u4e2d\u7ea7",
    "\u5168\u9762": "\u9ad8\u7ea7",
}


def read_json(name: str) -> Any:
    return json.loads((SOURCE_DIR / name).read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def public_source_path(src: str) -> Path:
    return ROOT / "public" / src.lstrip("/")


def course_image_name(course: dict[str, Any], page: int) -> str:
    return f"{course['id'].lower()}-p{page:03d}.webp"


def main() -> None:
    courses = read_json("courses.json")
    questions = read_json("questions.json")
    source_assets = read_json("assets.json")

    source_assets_by_id = {asset["id"]: asset for asset in source_assets}
    courses_by_id = {course["id"]: course for course in courses}
    questions_by_id = {question["id"]: question for question in questions}

    if PUBLIC_DIR.exists():
        shutil.rmtree(PUBLIC_DIR)

    for folder in CATEGORY_DIR.values():
        (PUBLIC_DIR / folder).mkdir(parents=True, exist_ok=True)

    course_image_by_asset: dict[str, str] = {}
    recorded_asset_paths: set[str] = set()
    data_assets: list[dict[str, Any]] = []

    for course in courses:
        category_folder = CATEGORY_DIR[course["category"]]
        image_paths = []
        for asset_id in course["exampleImages"][:1]:
            source_asset = source_assets_by_id[asset_id]
            page = int(source_asset["page"])
            target_name = course_image_name(course, page)
            target_path = PUBLIC_DIR / category_folder / target_name
            shutil.copyfile(public_source_path(source_asset["src"]), target_path)
            public_path = f"/assets/guandan/{category_folder}/{target_name}"
            course_image_by_asset[asset_id] = public_path
            image_paths.append(public_path)
            data_assets.append(
                {
                    "id": f"{course['id'].lower()}-source-image",
                    "source": "pdf",
                    "page": page,
                    "topic": course["knowledgePoints"][0],
                    "path": public_path,
                    "courseId": course["id"],
                }
            )
            recorded_asset_paths.add(public_path)
        course["frontImages"] = image_paths

    normalized_courses = []
    for course in courses:
        exercise_ids = list(course["exercises"])
        first_mistake = course["mistakes"][0]
        normalized_courses.append(
            {
                "id": course["id"],
                "title": course["title"],
                "category": course["category"],
                "difficulty": DIFFICULTY.get(course["difficulty"], course["difficulty"]),
                "description": course["contentBlocks"][0]["text"],
                "sourceChapter": course["sourceChapter"],
                "sourcePages": course["sourcePages"],
                "knowledgePoints": course["knowledgePoints"],
                "exampleImages": course["frontImages"],
                "mistakes": course["mistakes"],
                "exerciseIds": exercise_ids,
                "aiCoachPrompt": (
                    f"\u4f60\u662f AI \u63bc\u86cb\u6559\u7ec3\u3002\u8bf7\u57fa\u4e8e\u300a{course['title']}\u300b"
                    f"\u548c PDF \u6765\u6e90\u9875 {course['sourcePage']}\uff0c\u7528\u77ed\u53e5\u8bb2\u6e05\u6838\u5fc3\u5224\u65ad\u3001"
                    f"\u9519\u8bef\u6253\u6cd5\u548c\u6b63\u786e\u6253\u6cd5\u3002"
                ),
                "slogan": f"\u53e3\u8bc0\uff1a\u522b{first_mistake}\uff0c\u5148\u770b\u89d2\u8272\u3001\u724c\u6743\u548c\u5269\u4f59\u624b\u6570\u3002",
                "coreExplanation": course["contentBlocks"][2]["text"],
                "wrongPlay": first_mistake,
                "correctPlay": "\u5148\u56de\u5230 PDF \u724c\u4f8b\uff0c\u5224\u65ad\u5f53\u524d\u8eab\u4efd\u3001\u724c\u6743\u548c\u51fa\u724c\u540e\u8c01\u66f4\u8212\u670d\u3002",
                "aiReview": "\u4f60\u7684\u9009\u62e9\u4e0d\u53ea\u770b\u5bf9\u9519\uff0c\u8981\u590d\u76d8\u5224\u65ad\u4f9d\u636e\u662f\u5426\u6765\u81ea\u724c\u6743\u3001\u89d2\u8272\u548c\u724c\u8def\u53d8\u5316\u3002",
            }
        )

    normalized_questions = []
    for question in questions:
        course = courses_by_id[question["courseId"]]
        category_folder = CATEGORY_DIR[course["category"]]
        source_asset_id = question["image"]["assetId"].split("-s", 1)[0]
        image_path = course_image_by_asset.get(source_asset_id)
        if image_path is None:
            page = int(question["sourcePage"])
            source_asset = next(asset for asset in source_assets if asset["page"] == page and asset["sourceType"] == "pdf-fullpage")
            target_name = course_image_name(course, page)
            target_path = PUBLIC_DIR / category_folder / target_name
            if not target_path.exists():
                shutil.copyfile(public_source_path(source_asset["src"]), target_path)
            image_path = f"/assets/guandan/{category_folder}/{target_name}"
            if image_path not in recorded_asset_paths:
                data_assets.append(
                    {
                        "id": f"{course['id'].lower()}-question-p{page:03d}",
                        "source": "pdf",
                        "page": page,
                        "topic": question["tags"][0] if question["tags"] else course["knowledgePoints"][0],
                        "path": image_path,
                        "courseId": course["id"],
                    }
                )
                recorded_asset_paths.add(image_path)

        normalized_questions.append(
            {
                "id": question["id"],
                "assessment": question["assessment"],
                "type": question["type"],
                "difficulty": DIFFICULTY.get(question["difficulty"], question["difficulty"]),
                "question": question["question"],
                "options": [option["text"] for option in question["options"]],
                "answer": question["correctAnswer"],
                "analysis": question["explanation"],
                "wrongReasons": question["wrongReasons"],
                "aiCoachComment": question["aiCoachComment"],
                "image": image_path,
                "relatedCourse": question["courseId"],
            }
        )

    simple_count = sum(1 for question in normalized_questions if question["assessment"] == "simple")
    for question in normalized_questions:
        if simple_count >= 20:
            break
        if question["assessment"] == "course-drill":
            question["assessment"] = "simple"
            simple_count += 1

    categories = []
    for category, folder in CATEGORY_DIR.items():
        category_courses = [course["id"] for course in normalized_courses if course["category"] == category]
        categories.append(
            {
                "id": folder,
                "name": category,
                "description": CATEGORY_DESCRIPTION[category],
                "courses": category_courses,
            }
        )

    write_json(DATA_DIR / "learning-path.json", {"categories": categories})
    write_json(DATA_DIR / "courses.json", normalized_courses)
    write_json(DATA_DIR / "questions.json", normalized_questions)
    write_json(DATA_DIR / "assets.json", data_assets)

    missing = []
    for course in normalized_courses:
        for path in course["exampleImages"]:
            if not public_source_path(path).exists():
                missing.append(path)
        for question_id in course["exerciseIds"]:
            if question_id not in questions_by_id:
                missing.append(question_id)
    if missing:
        raise RuntimeError(f"missing generated references: {missing[:10]}")

    print(
        json.dumps(
            {
                "courses": len(normalized_courses),
                "questions": len(normalized_questions),
                "assets": len(data_assets),
                "categories": {item["name"]: len(item["courses"]) for item in categories},
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
