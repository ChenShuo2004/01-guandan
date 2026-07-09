from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pypdfium2 as pdfium


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PDF = Path(
    "D:/coding/00\uff1a\u77e5\u8bc6\u5927\u5168/\u63bc\u86cb/"
    "\u63bc\u86cb\u6280\u5de7\u79d8\u7c4d-\u7535\u5b50\u7248160\u9875.pdf"
)
OUTPUT_DIR = ROOT / "content" / "guandan-system"
PAGE_ASSET_DIR = ROOT / "public" / "assets" / "pdf" / "guandan-160" / "pages"

PDF_FILE_ID = "guandan-techniques-160"
SOURCE_TITLE = "\u63bc\u86cb\u6280\u5de7\u79d8\u7c4d-\u7535\u5b50\u7248160\u9875"


def slugify(text: str) -> str:
    mapping = {
        "\u57fa\u7840\u5165\u95e8": "beginner",
        "\u8fdb\u9636\u6280\u5de7": "intermediate",
        "\u9ad8\u624b\u4f53\u7cfb": "master",
        "\u6b8b\u5c40\u8bad\u7ec3": "endgame",
    }
    if text in mapping:
        return mapping[text]
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return slug or "topic"


def pdf_page(printed_page: int | None) -> int | None:
    if printed_page is None:
        return None
    return printed_page + 2


def page_asset_id(page: int) -> str:
    return f"gd-p{page:03d}-source-fullpage"


def page_asset_src(page: int) -> str:
    return f"/assets/pdf/guandan-160/pages/gd_p{page:03d}_source-fullpage_main_v01.webp"


@dataclass(frozen=True)
class CourseSeed:
    id: str
    title: str
    category: str
    source_chapter: str
    printed_pages: list[int]
    knowledge_points: list[str]
    example_usage: str
    mistakes: list[str]
    difficulty: str


COURSE_SEEDS: list[CourseSeed] = [
    CourseSeed("B01", "\u4e3a\u4ec0\u4e48\u8981\u5b66\u63bc\u86cb", "\u57fa\u7840\u5165\u95e8", "\u7b2c1\u7bc7", [7], ["\u8d77\u6e90", "\u56e2\u961f\u914d\u5408", "\u5b66\u4e60\u4ef7\u503c"], "\u5c01\u9762\u9875\u8f6c\u8bfe\u7a0b\u5934\u56fe", ["\u628a\u63bc\u86cb\u7406\u89e3\u6210\u5355\u4eba\u6bd4\u5927\u5c0f"], "\u7b80\u5355"),
    CourseSeed("B02", "\u80dc\u8d1f\u89c4\u5219\u4e0e\u724c\u578b\u6bd4\u8f83", "\u57fa\u7840\u5165\u95e8", "\u7b2c2\u7bc7", [8], ["\u5934\u6e38", "\u5347\u7ea7", "\u540c\u578b\u6bd4\u8f83", "\u70b8\u5f39\u4f8b\u5916"], "\u89c4\u5219\u6d41\u7a0b\u56fe", ["\u8ba4\u4e3a\u4efb\u4f55\u666e\u901a\u724c\u578b\u90fd\u53ef\u4ee5\u8de8\u578b\u6bd4\u5927\u5c0f"], "\u7b80\u5355"),
    CourseSeed("B03", "\u5934\u6e38\u7684\u56db\u79cd\u65b9\u5f0f", "\u57fa\u7840\u5165\u95e8", "\u7b2c3\u7bc7", [9], ["\u70b8\u5f39\u80dc", "\u95ef\u5173\u80dc", "\u542c\u724c\u80dc", "\u5077\u88ad\u80dc"], "\u56db\u8c61\u9650\u793a\u610f\u56fe", ["\u628a\u8bb0\u724c\u8bef\u5f53\u6210\u5934\u6e38\u65b9\u5f0f"], "\u7b80\u5355"),
    CourseSeed("B04", "\u95ef\u5173\u4e0e\u767b\u57fa\u724c", "\u57fa\u7840\u5165\u95e8", "\u7b2c4-5\u7bc7", [10, 11, 12], ["\u95ef\u5173", "\u51c0\u5173", "\u767b\u57fa\u724c", "\u56de\u624b"], "\u767b\u57fa\u724c\u9ad8\u4eae\u56fe", ["\u53ea\u8bb0\u5f97\u724c\u9762\u5927\uff0c\u4e0d\u770b\u540c\u578b\u6700\u5927\u724c"], "\u4e2d\u7b49"),
    CourseSeed("B05", "\u724c\u529b\u8861\u91cf", "\u57fa\u7840\u5165\u95e8", "\u7b2c6\u7bc7", [13, 14, 15], ["\u724c\u529b", "\u5f3a\u724c", "\u4e2d\u724c", "\u5f31\u724c", "\u8ba1\u70b9"], "\u539f\u4e66\u724c\u4f8b\u5207\u56fe\u52a0\u70b9\u6570\u6807\u6ce8", ["\u53ea\u51ed\u611f\u89c9\u8bf4\u724c\u597d\uff0c\u6ca1\u6709\u53ef\u6267\u884c\u5224\u65ad"], "\u4e2d\u7b49"),
    CourseSeed("B06", "\u70b8\u5f39\u7684\u771f\u5b9e\u4f5c\u7528", "\u57fa\u7840\u5165\u95e8", "\u7b2c7\u7bc7", [16, 17], ["\u70b8\u5f39", "\u724c\u8def\u626d\u8f6c", "\u963b\u6321", "\u62a4\u724c"], "\u5927\u70b8\u5c0f\u70b8\u5bf9\u6bd4\u56fe", ["\u770b\u5230\u70b8\u5f39\u5c31\u60f3\u7acb\u523b\u6253\u6389"], "\u4e2d\u7b49"),
    CourseSeed("B07", "\u914d\u70b8\u5165\u95e8", "\u57fa\u7840\u5165\u95e8", "\u7b2c8\u7bc7", [18, 19], ["\u914d\u70b8", "\u6570\u91cf", "\u8d28\u91cf", "\u9022\u4eba\u914d"], "\u7ea2\u68432\u914d\u6cd5\u5bf9\u6bd4\u56fe", ["\u4e3a\u4e86\u6210\u70b8\u727a\u7272\u6574\u4f53\u724c\u8def"], "\u4e2d\u7b49"),
    CourseSeed("B08", "\u4e03\u79cd\u724c\u8def\u7684\u5c5e\u6027", "\u57fa\u7840\u5165\u95e8", "\u7b2c9\u7bc7", [20, 21], ["\u5355\u5f20", "\u5bf9\u5b50", "\u4e09\u540c\u724c", "3+2", "\u987a\u5b50", "\u6728\u677f", "\u94a2\u677f"], "\u4e03\u724c\u8def\u96f7\u8fbe\u56fe", ["\u53ea\u770b\u724c\u578b\u5927\u5c0f\uff0c\u4e0d\u770b\u901f\u5ea6\u548c\u7075\u6d3b\u6027"], "\u4e2d\u7b49"),
    CourseSeed("B09", "\u4e03\u79cd\u724c\u8def\u7684\u5b9e\u6218\u7279\u70b9", "\u57fa\u7840\u5165\u95e8", "\u7b2c10\u7bc7", [22, 23], ["\u724c\u8def\u7279\u70b9", "\u63a7\u5236", "\u7075\u6d3b\u6027"], "\u724c\u8def\u4f18\u7f3a\u70b9\u4fe1\u606f\u56fe", ["\u4e0d\u533a\u5206\u5148\u51fa\u724c\u8def\u548c\u540e\u53d1\u724c\u8def"], "\u4e2d\u7b49"),
    CourseSeed("B10", "\u4e3b\u653b\u4e0e\u52a9\u653b\u5206\u5de5", "\u57fa\u7840\u5165\u95e8", "\u7b2c11\u7bc7", [24, 25, 26, 27, 28, 29], ["\u4e3b\u653b", "\u52a9\u653b", "\u804c\u8d23", "\u89d2\u8272\u8f6c\u6362"], "\u53cc\u89d2\u8272\u804c\u8d23\u56fe", ["\u5f31\u724c\u4e5f\u5f3a\u884c\u4e3b\u653b"], "\u4e2d\u7b49"),
    CourseSeed("B11", "\u8fdb\u8d21\u4e0e\u8fd8\u8d21\u57fa\u7840", "\u57fa\u7840\u5165\u95e8", "\u7b2c34-35\u7bc7", [80, 81, 82], ["\u8fdb\u8d21", "\u8fd8\u8d21", "\u9632\u6210\u70b8"], "\u8fdb\u8d21\u524d\u540e\u724c\u578b\u53d8\u5316\u56fe", ["\u8fd8\u8d21\u53ea\u770b\u5355\u5f20\u5927\u5c0f\uff0c\u4e0d\u770b\u662f\u5426\u9001\u70b8"], "\u4e2d\u7b49"),
    CourseSeed("B12", "\u8bb0\u724c\u5165\u95e8", "\u57fa\u7840\u5165\u95e8", "\u7b2c36-39\u7bc7", [83, 84, 85, 86, 87, 88], ["\u8bb0\u738b", "\u8bb0\u4e3b\u724c", "\u8bb0A", "\u8bb0\u70b8\u5f39", "\u724c\u8def\u63a8\u65ad"], "\u5361\u7247\u5f0f\u8bb0\u724c\u5668UI", ["\u4e00\u4e0a\u6765\u5c31\u60f3\u8bb0\u5168\u90e8\u724c"], "\u5168\u9762"),
    CourseSeed("J01", "\u4e3b\u653b\u5148\u624b\u4e0e\u5904\u7406\u5f31\u8def", "\u8fdb\u9636\u6280\u5de7", "\u7b2c12\u7bc7", [30], ["\u5148\u624b", "\u5f31\u8def", "\u5355\u5f20", "\u540e\u53d1\u5236\u4eba"], "\u5f31\u8def\u5148\u540e\u624b\u52a8\u753b", ["\u628a\u5c0f\u5355\u5f20\u957f\u671f\u7559\u5230\u6b8b\u5c40"], "\u4e2d\u7b49"),
    CourseSeed("J02", "\u5c3e\u724c\u539f\u7406", "\u8fdb\u9636\u6280\u5de7", "\u7b2c13\u7bc7", [31, 32], ["\u5c3e\u724c", "\u5f20\u529b", "\u5361\u4f4d"], "\u5355\u5f203/6\u5148\u540e\u5bf9\u6bd4\u56fe", ["\u7559\u6700\u5927\u724c\u4f5c\u5c3e\uff0c\u5ffd\u7565\u4e0b\u5bb6\u987a\u8d70"], "\u4e2d\u7b49"),
    CourseSeed("J03", "\u5c3e\u724c\u539f\u7406\u5728\u6b8b\u5c40\u4e2d\u7684\u5e94\u7528", "\u8fdb\u9636\u6280\u5de7", "\u7b2c14\u7bc7", [33, 34, 35], ["\u5355\u5f20\u5c3e\u724c", "\u5bf9\u5b50\u5c3e\u724c", "3+2\u5c3e\u724c"], "\u56db\u5bb6\u6b8b\u5c40\u56fe\u88c1\u526a", ["\u53ea\u770b\u80fd\u5426\u8d70\u5b8c\uff0c\u4e0d\u770b\u8c01\u4f1a\u987a\u8d70"], "\u5168\u9762"),
    CourseSeed("J04", "\u521d\u671f\u987a\u724c\u4e0e\u4e0d\u6253\u4e0a\u5bb6", "\u8fdb\u9636\u6280\u5de7", "\u7b2c15\u7bc7", [36], ["\u987a\u724c", "\u4e0a\u5bb6", "\u4fe1\u606f\u66b4\u9732"], "\u65f6\u5e8f\u793a\u610f\u52a8\u753b", ["\u628a\u201c\u521d\u671f\u4e0d\u6253\u4e0a\u5bb6\u201d\u7406\u89e3\u6210\u7edd\u5bf9\u7981\u4ee4"], "\u4e2d\u7b49"),
    CourseSeed("J05", "\u51fa\u70b8\u4e4b\u70b8\u4ec0\u4e48", "\u8fdb\u9636\u6280\u5de7", "\u7b2c16\u7bc7", [37, 38], ["\u51fa\u70b8", "\u8d85\u6253", "\u7ecf\u6d4e\u6027"], "\u70b8\u5f39\u4ef7\u503c\u6392\u5e8f\u5361", ["\u7528\u8fc7\u5927\u70b8\u5f39\u53bb\u538b\u5c0f\u5c42\u7ea7\u70b8\u5f39"], "\u4e2d\u7b49"),
    CourseSeed("J06", "\u51fa\u70b8\u4e4b\u70b8\u8c01\u4e0e\u4f55\u65f6\u70b8", "\u8fdb\u9636\u6280\u5de7", "\u7b2c17-18\u7bc7", [39, 40, 41], ["\u70b8\u8c01", "\u65f6\u673a", "\u5c0f\u70b8", "\u5927\u70b8"], "\u4e0a\u5bb6\u4e0b\u5bb6\u5bf9\u5bb6\u6d41\u7a0b\u56fe", ["\u70b8\u4e0b\u5bb6\u540e\u7acb\u523b\u653e\u5c0f\u5355"], "\u5168\u9762"),
    CourseSeed("J07", "\u51fa\u70b8\u4e4b\u7528\u54ea\u4e2a\u70b8", "\u8fdb\u9636\u6280\u5de7", "\u7b2c19\u7bc7", [42, 43], ["\u70b8\u5f39\u5927\u5c0f", "\u8bf1\u70b8", "\u7075\u6d3b\u6027"], "\u591a\u70b8\u9009\u62e9\u52a8\u753b", ["\u5148\u7528\u6700\u7075\u6d3b\u7684\u70b8\uff0c\u628a\u81ea\u5df1\u6253\u6b7b"], "\u5168\u9762"),
    CourseSeed("J08", "\u4f18\u5316\u624b\u6570", "\u8fdb\u9636\u6280\u5de7", "\u7b2c20\u7bc7", [44, 45], ["\u624b\u6570", "\u7ec4\u724c", "\u56de\u6536", "\u63a5\u624b\u5f20"], "\u7406\u724c\u524d\u540e\u5bf9\u6bd4\u52a8\u56fe", ["\u53ea\u770b\u5355\u624b\u5927\u5c0f\uff0c\u4e0d\u770b\u603b\u624b\u6570"], "\u4e2d\u7b49"),
    CourseSeed("J09", "\u62c6\u70b8\u6280\u5de7", "\u8fdb\u9636\u6280\u5de7", "\u7b2c21\u7bc7", [46, 47], ["\u62c6\u70b8", "\u51cf\u624b\u6570", "\u589e\u767b\u57fa"], "\u62c6\u70b8\u5206\u53c9\u56fe", ["\u8ba4\u4e3a\u62c6\u70b8\u6c38\u8fdc\u4e0d\u503c\u5f97"], "\u5168\u9762"),
    CourseSeed("J10", "\u4fdd\u7559\u5b9e\u529b\u4e0e\u65e0\u5948\u7b49\u5f85", "\u8fdb\u9636\u6280\u5de7", "\u7b2c22\u7bc7", [48, 49], ["\u4fdd\u7559\u5b9e\u529b", "\u7b49\u5f85", "\u63a7\u5236"], "\u7b49\u5f85\u4e0e\u5f00\u70b8\u5bf9\u6bd4\u56fe", ["\u5f62\u6210\u51b2\u523a\u524d\u628a\u63a7\u5236\u724c\u5168\u4ea4\u6389"], "\u5168\u9762"),
    CourseSeed("J11", "\u6b8b\u5c40\u9022\u70b8\u4e3a\u5148\u4e0e\u9a97\u70b8", "\u8fdb\u9636\u6280\u5de7", "\u7b2c23-24\u7bc7", [50, 51, 52], ["\u9022\u70b8\u4e3a\u5148", "\u9a97\u70b8", "\u6b8b\u8840\u5c40"], "\u5148\u70b8\u540e\u70b8\u5bf9\u5c40\u52a8\u753b", ["\u628a\u9a97\u70b8\u7406\u89e3\u6210\u5355\u7eaf\u9a97\u6389\u4e00\u70b8"], "\u5168\u9762"),
    CourseSeed("J12", "\u7559\u98ce\u6280\u5de7", "\u8fdb\u9636\u6280\u5de7", "\u7b2c25\u7bc7", [53, 54], ["\u7559\u98ce", "\u5934\u6e38", "\u5347\u7ea7"], "\u7559\u98ce\u7ed3\u679c\u6811", ["\u53ea\u770b\u80fd\u5426\u5934\u6e38\uff0c\u4e0d\u770b\u5347\u7ea7\u6536\u76ca"], "\u4e2d\u7b49"),
    CourseSeed("J13", "\u52a9\u653b\u8d77\u624b\u4e0e\u9632\u5b88", "\u8fdb\u9636\u6280\u5de7", "\u7b2c26-29\u7bc7", [66, 67, 68, 69, 70, 71], ["\u5bf9\u5b50\u5148\u884c", "\u5355\u5f20\u9632\u5b88", "\u4fa6\u5bdf", "\u521d\u671f\u4e0d\u70b8\u4e0b\u5bb6"], "Q/J/10\u5361\u4f4d\u793a\u610f\u56fe", ["\u60c5\u51b5\u4e0d\u660e\u65f6\u76f2\u76ee\u5f3a\u653b"], "\u5168\u9762"),
    CourseSeed("J14", "\u52a9\u653b\u9001\u724c\u4e0e\u8f6c\u4e3b\u653b", "\u8fdb\u9636\u6280\u5de7", "\u7b2c30-33\u7bc7", [72, 73, 74, 75, 76, 77, 78, 79], ["\u9001\u6865", "\u9001\u542c", "\u89d2\u8272\u8f6c\u6362"], "\u9001\u724c\u8def\u5f84\u52a8\u753b", ["\u9001\u724c\u53ea\u9001\u81ea\u5df1\u987a\u624b\u7684\u724c"], "\u5168\u9762"),
    CourseSeed("G01", "\u9022\u4eba\u914d\u8fdb\u9636", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c40\u7bc7", [93], ["\u9022\u4eba\u914d", "\u8865\u7f3a", "\u7075\u6d3b\u6027"], "\u9022\u4eba\u914d\u4e09\u65b9\u6848\u5bf9\u6bd4\u56fe", ["\u9022\u4eba\u914d\u53ea\u4e3a\u6210\u70b8\uff0c\u4e0d\u770b\u624b\u6570"], "\u5168\u9762"),
    CourseSeed("G02", "\u70b8\u5f39\u7684\u62a4\u724c\u4f5c\u7528", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c41\u7bc7", [94, 95, 96, 97], ["\u62a4\u724c", "\u6b8b\u5c40", "\u70b8\u5f39\u4f18\u52bf"], "\u62a4\u724c\u6848\u4f8b\u8fde\u5e27\u56fe", ["\u6b8b\u5c40\u91cc\u53ea\u8ffd\u6c42\u7acb\u523b\u51c0\u5173"], "\u5168\u9762"),
    CourseSeed("G03", "\u70b8\u5f39\u7684\u963b\u6321\u4f5c\u7528", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c42\u7bc7", [98, 99], ["\u963b\u6321", "\u6b62\u635f", "\u529b\u633d\u72c2\u6f9c"], "\u963b\u6321\u6848\u4f8b\u56fe", ["\u52a3\u52bf\u5c40\u76f4\u63a5\u653e\u5f03\u8282\u594f"], "\u5168\u9762"),
    CourseSeed("G04", "\u6865\u724c\u7684\u8fd0\u7528", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c43\u7bc7", [100, 101], ["\u6865\u724c", "\u9001\u6865", "\u63a5\u5e94"], "\u6865\u724c\u8def\u5f84\u52a8\u56fe", ["\u628a\u6865\u724c\u5f53\u6210\u968f\u4fbf\u63a5\u4e00\u624b"], "\u5168\u9762"),
    CourseSeed("G05", "\u7ec4\u724c\u8981\u51fa\u5c3d", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c44\u7bc7", [102, 103], ["\u7ec4\u724c", "\u51fa\u5c3d", "\u8282\u594f"], "\u591a\u624b3+2\u548c\u987a\u5b50\u8282\u594f\u56fe", ["\u4e3a\u4e86\u4fdd\u7559\u5927\u724c\u800c\u62d6\u6b7b\u7ec4\u724c"], "\u5168\u9762"),
    CourseSeed("G06", "\u738b\u591a\u6218\u6cd5", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c45\u7bc7", [104, 105], ["\u738b\u591a", "\u5355\u8def\u63a7\u5236", "\u8bf1\u70b8"], "\u738b\u724c\u5206\u5e03\u56fe", ["\u738b\u591a\u65f6\u53ea\u60f3\u538b\u6b7b\u5bf9\u624b"], "\u5168\u9762"),
    CourseSeed("G07", "\u65e0\u738b\u6218\u6cd5\u4e0e\u5c11\u8f93\u5f53\u8d62", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c46\u7bc7", [106, 107], ["\u65e0\u738b", "\u6b62\u635f", "\u5c11\u8f93\u5f53\u8d62"], "\u65e0\u738b\u5f3a\u724c\u5f31\u724c\u5bf9\u6bd4\u56fe", ["\u8ba4\u4e3a\u65e0\u738b\u5c31\u4e00\u5b9a\u662f\u5f31\u724c"], "\u5168\u9762"),
    CourseSeed("G08", "\u653e\u4e00\u5bb6\u6253\u4e00\u5bb6", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c47\u7bc7", [108, 109], ["\u6218\u7565\u6b62\u635f", "\u653e\u4e00\u5bb6", "\u6253\u4e00\u5bb6"], "\u653e\u4e00\u5bb6\u6253\u4e00\u5bb6\u51b3\u7b56\u6811", ["\u628a\u6218\u7565\u53d6\u820d\u7406\u89e3\u6210\u65e0\u8111\u653e\u724c"], "\u5168\u9762"),
    CourseSeed("G09", "\u8c01\u6253\u8c01\u6536\u4e0e\u610f\u56fe\u963b\u65ad", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c48-49\u7bc7", [110, 111, 112, 113], ["\u56de\u6536", "\u963b\u65ad", "\u5c01\u9876"], "\u5148\u6253\u5148\u6536\u793a\u610f\u56fe", ["\u88ab\u52a8\u8ddf\u724c\uff0c\u4e0d\u8bfb\u5bf9\u65b9\u56de\u6536\u610f\u56fe"], "\u5168\u9762"),
    CourseSeed("G10", "\u5355\u5f20\u5361\u4f4d\u4e0e\u724c\u8def\u591a\u6837\u6027", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c50-53\u7bc7", [114, 118, 121, 125], ["\u5361\u4f4d", "\u591a\u6837\u6027", "\u7075\u6d3b\u6027"], "\u5355\u5f20\u5361\u4f4d\u5bf9\u6bd4\u56fe", ["\u4e3a\u4e86\u4e00\u624b\u538b\u4f4f\u800c\u8017\u5c3d\u53d8\u5316"], "\u5168\u9762"),
    CourseSeed("G11", "\u4fe1\u606f\u6536\u653e\u4e0e\u5fc3\u7406\u8282\u594f", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c54\u300158-60\u7bc7", [126, 127, 135, 136, 137], ["\u4fe1\u606f\u6536\u653e", "\u5fc3\u6001", "\u8282\u594f"], "\u4fe1\u606f\u663e\u9732\u5c42\u7ea7\u56fe", ["\u8f93\u724c\u540e\u7acb\u523b\u8d23\u602a\u961f\u53cb"], "\u5168\u9762"),
    CourseSeed("G12", "\u98ce\u683c\u5206\u6790\u3001\u5ea7\u4f4d\u4e0e\u89c2\u5bdf", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c61-64\u7bc7", [138, 139, 140, 141, 142], ["\u98ce\u683c", "\u63a7\u5236\u578b", "\u51b2\u950b\u578b", "\u5ea7\u4f4d", "\u89c2\u5bdf"], "\u98ce\u683c\u753b\u50cf\u5361", ["\u53ea\u770b\u724c\uff0c\u4e0d\u770b\u4eba\u548c\u4f4d\u7f6e"], "\u4e2d\u7b49"),
    CourseSeed("G13", "\u8ff7\u60d1\u3001\u793c\u4eea\u4e0e\u884c\u4e1a\u89c6\u91ce", "\u9ad8\u624b\u4f53\u7cfb", "\u7b2c65-71\u7bc7", [143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160], ["\u8ff7\u60d1", "\u793c\u4eea", "\u62a5\u724c", "AI", "\u5e73\u53f0"], "\u5408\u89c4\u8fb9\u754c\u56fe\u548c\u4ea7\u54c1\u89c6\u91ce\u56fe", ["\u7528\u660e\u663e\u8868\u60c5\u6216\u6697\u53f7\u505a\u8ff7\u60d1"], "\u4e2d\u7b49"),
    CourseSeed("C01", "\u5355\u5f20\u5c3e\u724c\u6b8b\u5c40", "\u6b8b\u5c40\u8bad\u7ec3", "\u7b2c14\u7bc7", [33], ["\u5c3e\u724c", "\u5355\u5f20", "\u5361\u4e0b\u5bb6"], "PDF\u5355\u5f20\u5c3e\u724c\u5c40\u5207\u56fe", ["\u4e0d\u8bc4\u4f30\u4e0b\u5bb6\u987a\u8d70\u533a\u95f4"], "\u5168\u9762"),
    CourseSeed("C02", "\u5bf9\u5b50\u4e0e\u4e09\u5e26\u4e8c\u5c3e\u724c\u6b8b\u5c40", "\u6b8b\u5c40\u8bad\u7ec3", "\u7b2c14\u7bc7", [34, 35], ["\u5bf9\u5b50\u5c3e\u724c", "3+2", "\u6b8b\u5c40"], "PDF\u5bf9\u5b50/3+2\u56fe\u88c1\u526a", ["\u62c6\u6210\u6563\u724c\u540e\u5931\u53bb\u6536\u5c3e\u80fd\u529b"], "\u5168\u9762"),
    CourseSeed("C03", "\u70b8\u5f39\u62a4\u724c\u6b8b\u5c40", "\u6b8b\u5c40\u8bad\u7ec3", "\u7b2c41\u7bc7", [94, 95, 96, 97], ["\u70b8\u5f39", "\u62a4\u724c", "\u6b8b\u5c40"], "PDF\u7b2c94-99\u9875\u62a4\u724c\u6848\u4f8b\u5207\u56fe", ["\u53ea\u770b\u51c0\u5173\uff0c\u4e0d\u770b\u62a4\u724c\u6536\u76ca"], "\u5168\u9762"),
    CourseSeed("C04", "\u70b8\u5f39\u963b\u6321\u6b8b\u5c40", "\u6b8b\u5c40\u8bad\u7ec3", "\u7b2c42\u7bc7", [98, 99], ["\u963b\u6321", "\u6b62\u635f", "\u53cd\u6251"], "PDF\u963b\u6321\u6848\u4f8b\u56fe", ["\u52a3\u52bf\u5c40\u4e0d\u6562\u7528\u70b8\u5f39\u6362\u8282\u594f"], "\u5168\u9762"),
    CourseSeed("C05", "\u4f59\u4e94\u81f3\u4f59\u516d\u5f20\u6b8b\u5c40", "\u6b8b\u5c40\u8bad\u7ec3", "\u7b2c55\u7bc7", [130], ["\u4f595", "\u4f596", "\u542c\u724c", "\u9632\u5b88"], "\u62a5\u724c\u72b6\u6001\u5361", ["\u53ea\u770b\u5927\u724c\uff0c\u4e0d\u770b\u5269\u4f59\u624b\u6570"], "\u5168\u9762"),
    CourseSeed("C06", "\u4f59\u4e03\u81f3\u4f59\u516b\u5f20\u6b8b\u5c40", "\u6b8b\u5c40\u8bad\u7ec3", "\u7b2c56\u7bc7", [133], ["\u4f597", "\u4f598", "\u5371\u9669\u724c\u578b"], "\u5371\u9669\u724c\u578b\u56fe\u8c31", ["\u8fc7\u65e9\u9001\u5c0f\u5355\u6216\u5bf9\u5b50"], "\u5168\u9762"),
    CourseSeed("C07", "\u4f59\u4e5d\u81f3\u4f59\u5341\u5f20\u6b8b\u5c40", "\u6b8b\u5c40\u8bad\u7ec3", "\u7b2c57\u7bc7", [134], ["\u4f599", "\u4f5910", "3+2", "\u987a\u5b50"], "\u5371\u9669\u724c\u578b\u56fe\u8c31", ["\u5ffd\u75653+2\u6216\u987a\u5b50\u578b\u7ec4\u5408"], "\u5168\u9762"),
    CourseSeed("C08", "\u4e3b\u653b\u6b8b\u5c40\u51b2\u523a", "\u6b8b\u5c40\u8bad\u7ec3", "\u7b2c12-25\u7bc7", [30, 31, 32, 37, 38, 39, 48, 49, 53], ["\u4e3b\u653b\u51b2\u523a", "\u624b\u6570", "\u7559\u98ce"], "\u8fde\u7eed\u724c\u5c40\u5e27", ["\u4e3b\u653b\u53ea\u987e\u51b2\uff0c\u4e0d\u770b\u7559\u98ce\u548c\u63a7\u5236"], "\u5168\u9762"),
    CourseSeed("C09", "\u52a9\u653b\u6b8b\u5c40\u9001\u6865\u4e0e\u9001\u542c", "\u6b8b\u5c40\u8bad\u7ec3", "\u7b2c26-33\u7bc7", [66, 69, 72, 75, 79], ["\u52a9\u653b", "\u9001\u6865", "\u9001\u542c"], "\u4e09\u6b65\u9001\u6865\u52a8\u753b", ["\u4e0d\u770b\u5bf9\u5bb6\u610f\u613f\uff0c\u76f2\u76ee\u9001\u724c"], "\u5168\u9762"),
    CourseSeed("C10", "\u7efc\u5408\u5b9e\u6218\u590d\u76d8\u5173", "\u6b8b\u5c40\u8bad\u7ec3", "\u5168\u4e66\u56fe\u4f8b", [33, 39, 66, 93, 130, 133, 134], ["\u590d\u76d8", "\u8def\u5f84\u63a8\u8350", "\u9519\u56e0\u5206\u6790"], "\u591a\u6b65\u56de\u653e\u52a8\u753b", ["\u590d\u76d8\u53ea\u627e\u4e00\u6b65\u9519\uff0c\u4e0d\u627e\u9519\u8bef\u94fe"], "\u5168\u9762"),
]


SIMPLE_QUESTIONS = [
    ("S01", "B02", "\u5224\u65ad", "\u7b80\u5355", ["\u5934\u6e38\u5b9a\u80dc\u8d1f"], "\u4e00\u76d8\u80dc\u8d1f\u4e3b\u8981\u7531\u5934\u6e38\u51b3\u5b9a\u3002", "\u5bf9", ["\u9519", "\u4e0d\u4e00\u5b9a"], "\u82e5\u7b54\u9519\uff0c\u5148\u56de\u770b\u80dc\u8d1f\u89c4\u5219\u3002", 8, False),
    ("S02", "B02", "\u9009\u62e9", "\u7b80\u5355", ["\u540c\u578b\u6bd4\u8f83", "\u70b8\u5f39"], "\u666e\u901a\u724c\u578b\u80fd\u5426\u8de8\u724c\u578b\u6bd4\u8f83\u5927\u5c0f\uff1f", "\u4e0d\u80fd\uff0c\u53ea\u6709\u70b8\u5f39\u53ef\u8de8\u578b", ["\u53ef\u4ee5", "\u53ea\u6709\u5355\u5f20\u53ef\u4ee5", "\u53ea\u770b\u70b9\u6570"], "\u8bf4\u660e\u724c\u578b\u5e95\u5c42\u89c4\u5219\u9700\u8981\u8865\u5f3a\u3002", 8, False),
    ("S03", "B03", "\u9009\u62e9", "\u7b80\u5355", ["\u5934\u6e38\u56db\u6cd5"], "\u4e0b\u5217\u54ea\u9879\u4e0d\u5c5e\u4e8e\u5934\u6e38\u4e3b\u8981\u65b9\u5f0f\uff1f", "\u8bb0\u724c\u80dc", ["\u70b8\u5f39\u80dc", "\u95ef\u5173\u80dc", "\u542c\u724c\u80dc"], "\u8bb0\u724c\u662f\u624b\u6bb5\uff0c\u4e0d\u662f\u5934\u6e38\u7ed3\u679c\u3002", 9, False),
    ("S04", "B04", "\u586b\u7a7a", "\u7b80\u5355", ["\u767b\u57fa\u724c"], "\u540c\u724c\u578b\u4e2d\u6700\u5927\u7684\u724c\u79f0\u4e3a____\u3002", "\u767b\u57fa\u724c", ["\u5934\u6e38\u724c", "\u4e3b\u653b\u724c", "\u8fd8\u8d21\u724c"], "\u82e5\u4e0d\u4f1a\uff0c\u8865 B04\u3002", 10, False),
    ("S05", "B05", "\u9009\u62e9", "\u7b80\u5355", ["\u724c\u529b\u8861\u91cf"], "\u8d77\u624b12\u70b9\u4ee5\u4e0a\u5f3a\u724c\u66f4\u9002\u5408\u4ec0\u4e48\u7b56\u7565\uff1f", "\u4e3b\u653b\u4e89\u5934\u6e38", ["\u5168\u7a0b\u52a9\u653b", "\u53ea\u7559\u724c\u9632\u5b88", "\u5148\u62c6\u5927\u724c"], "\u5148\u8865\u724c\u529b\u5206\u5c42\uff0c\u518d\u5b66\u89d2\u8272\u5206\u5de5\u3002", 13, False),
    ("S06", "B06", "\u5224\u65ad", "\u7b80\u5355", ["\u70b8\u5f39\u4f5c\u7528"], "\u5927\u70b8\u5728\u6240\u6709\u9636\u6bb5\u90fd\u4e00\u5b9a\u6bd4\u5c0f\u70b8\u66f4\u503c\u94b1\u3002", "\u9519", ["\u5bf9"], "\u70b8\u5f39\u7684\u4ef7\u503c\u53d6\u51b3\u4e8e\u662f\u5426\u626d\u8f6c\u724c\u8def\u3002", 16, False),
    ("S07", "B10", "\u9009\u62e9", "\u7b80\u5355", ["\u4e3b\u653b\u804c\u8d23"], "\u4e3b\u653b\u6700\u91cd\u8981\u7684\u804c\u8d23\u4e0d\u5305\u62ec\u54ea\u9879\uff1f", "\u9001\u5bf9\u5bb6", ["\u4e89\u5934\u6e38", "\u5904\u7406\u5f31\u8def", "\u63a7\u5236\u8282\u594f"], "\u8bf4\u660e\u4e3b\u653b/\u52a9\u653b\u8fb9\u754c\u4e0d\u6e05\u3002", 24, False),
    ("S08", "J13", "\u9009\u62e9", "\u4e2d\u7b49", ["\u5bf9\u5b50\u5148\u884c"], "\u52a9\u653b\u8d77\u624b\u5728\u60c5\u51b5\u4e0d\u660e\u65f6\u4f18\u5148\u6253\u4ec0\u4e48\uff1f", "\u5bf9\u5b50", ["\u5c0f\u5355\u5f20", "\u6700\u5927\u5355\u5f20", "\u70b8\u5f39"], "\u8865 J13\uff0c\u5148\u5b66\u4fa6\u5bdf\u548c\u793a\u5f31\u3002", 66, False),
    ("S09", "J13", "\u5224\u65ad", "\u4e2d\u7b49", ["\u521d\u671f\u4e0d\u70b8\u4e0b\u5bb6"], "\u52a9\u653b\u521d\u671f\u4e00\u822c\u4e3b\u5f20\u4f18\u5148\u70b8\u4e0b\u5bb6\u3002", "\u9519", ["\u5bf9"], "\u521d\u671f\u5148\u770b\u5bf9\u5bb6\u724c\u8def\uff0c\u4e0d\u76f2\u76ee\u7834\u574f\u987a\u724c\u7a7a\u95f4\u3002", 69, False),
    ("S10", "B12", "\u9009\u62e9", "\u4e2d\u7b49", ["\u8bb0\u738b", "\u8bb0\u4e3b\u724c"], "\u8bb0\u724c\u5165\u95e8\u6700\u6838\u5fc3\u7684\u7b2c\u4e00\u5c42\u662f\u4ec0\u4e48\uff1f", "\u5148\u8bb04\u5f20\u738b\uff0c\u518d\u8bb0\u4e3b\u724c/A", ["\u5148\u8bb0\u5168\u90e8\u5c0f\u724c", "\u53ea\u8bb0\u70b8\u5f39", "\u53ea\u8bb0\u81ea\u5df1\u51fa\u8fc7\u7684\u724c"], "\u8bb0\u724c\u8981\u5206\u5c42\uff0c\u4e0d\u8981\u4e00\u6b65\u5230\u4f4d\u3002", 83, False),
    ("S11", "J03", "\u6b8b\u5c40\u6a21\u62df", "\u4e2d\u7b49", ["\u5c3e\u724c\u539f\u7406"], "\u5355\u5f20\u5c3e\u724c\u5c40\u4e2d\u5e94\u5148\u51fa\u5927\u8fd8\u662f\u5148\u51fa\u5c0f\uff1f", "\u89c6\u662f\u5426\u8981\u5361\u4e0b\u5bb6\uff0c\u901a\u5e38\u5148\u51fa\u7565\u5927\u7559\u6700\u5c0f\u4f5c\u5c3e", ["\u6c38\u8fdc\u5148\u51fa\u6700\u5c0f", "\u6c38\u8fdc\u5148\u51fa\u6700\u5927", "\u76f4\u63a5\u8fc7\u724c"], "\u53ea\u4f1a\u673a\u68b0\u51fa\u5c0f\uff0c\u8bf4\u660e\u672a\u7406\u89e3\u5c3e\u724c\u5f20\u529b\u3002", 33, True),
    ("S12", "C06", "\u9009\u62e9", "\u4e2d\u7b49", ["\u4f597/8\u6b8b\u5c40"], "\u654c\u65b9\u4f597\u5f20\u65f6\uff0c\u9632\u5b88\u65b9\u66f4\u5b89\u5168\u7684\u601d\u8def\u662f\u4ec0\u4e48\uff1f", "\u4f18\u5148\u51fa\u7ec4\u724c\uff0c\u5fcc\u51fa\u5c0f\u5355/\u5bf9\u5b50", ["\u5148\u9001\u5c0f\u5355", "\u5148\u9001\u5c0f\u5bf9", "\u53ea\u770b\u6700\u5927\u724c"], "\u82e5\u8bef\u7b54\uff0c\u8865 C06\u3002", 133, False),
]


FULL_QUESTION_SEEDS = [
    ("A01", "B02", "\u5224\u65ad", "\u7b80\u5355", ["\u89c4\u5219"], "\u4e00\u4eba\u62ff\u5230\u5934\u6e38\uff0c\u5168\u961f\u5347\u7ea7\u3002", "\u5bf9", 8, False),
    ("A02", "B06", "\u9009\u62e9", "\u7b80\u5355", ["\u70b8\u5f39", "\u724c\u8def"], "\u70b8\u5f39\u4e3b\u8981\u6539\u53d8\u4e86\u4ec0\u4e48\uff1f", "\u724c\u8def\u4e0e\u4e3b\u52a8\u6743", 16, False),
    ("A03", "B03", "\u9009\u62e9", "\u7b80\u5355", ["\u5934\u6e38\u65b9\u5f0f"], "\u542c\u724c\u80dc\u66f4\u4f9d\u8d56\u4ec0\u4e48\uff1f", "\u961f\u53cb\u9001\u724c/\u914d\u5408", 9, False),
    ("A04", "B04", "\u586b\u7a7a", "\u7b80\u5355", ["\u767b\u57fa\u724c"], "\u987a\u5b50\u4e2d\u7684\u767b\u57fa\u987a\u5b50\u662f____\u3002", "10JQKA", 10, False),
    ("A05", "J01", "\u9009\u62e9", "\u4e2d\u7b49", ["\u4e3b\u653b\u5148\u624b"], "\u54ea\u79cd\u66f4\u9002\u5408\u5f3a\u724c\u9996\u653b\uff1f", "\u5148\u5904\u7406\u5f31\u5355\u5f20", 30, False),
    ("A06", "J01", "\u5224\u65ad", "\u4e2d\u7b49", ["\u5f31\u8def\u5904\u7406"], "\u4e24\u4e2a\u5c0f\u5355\u5f20\u53ef\u4ee5\u957f\u671f\u7559\u5230\u6b8b\u5c40\u518d\u5904\u7406\u3002", "\u9519", 30, False),
    ("A07", "J02", "\u9009\u62e9", "\u4e2d\u7b49", ["\u5c3e\u724c"], "\u5c3e\u724c\u539f\u7406\u6700\u6838\u5fc3\u7684\u76ee\u6807\u662f\u4ec0\u4e48\uff1f", "\u51cf\u5c11\u4e0b\u5bb6\u987a\u8d70\u5173\u952e\u5c0f\u724c", 31, False),
    ("A08", "J03", "\u6b8b\u5c40\u6a21\u62df", "\u4e2d\u7b49", ["\u5c3e\u724c"], "\u4f60\u67093\u548c6\u4e24\u5f20\u5c0f\u5355\uff0c\u5148\u51fa\u54ea\u5f20\uff1f", "\u901a\u5e38\u5148\u51fa6\uff0c\u75593\u4f5c\u5c3e", 33, True),
    ("A09", "J04", "\u5224\u65ad", "\u4e2d\u7b49", ["\u4e0d\u6253\u4e0a\u5bb6"], "\u521d\u671f\u4efb\u4f55\u65f6\u5019\u90fd\u4e0d\u6253\u4e0a\u5bb6\u3002", "\u9519", 36, False),
    ("A10", "J05", "\u9009\u62e9", "\u4e2d\u7b49", ["\u70b8\u4ec0\u4e48\u724c"], "\u9047\u5230\u654c\u65b9\u70b8\u5f39\u65f6\u6700\u7ecf\u6d4e\u7684\u538b\u6cd5\u662f\u4ec0\u4e48\uff1f", "\u6253\u70b8\u5f39\uff0c\u5c3d\u91cf\u540c\u5c42\u538b\u5236", 37, False),
    ("A11", "J06", "\u9009\u62e9", "\u4e2d\u7b49", ["\u70b8\u8c01"], "\u51fa\u70b8\u901a\u5e38\u4f18\u5148\u6253\u8c01\uff1f", "\u4e0a\u5bb6\u4f18\u5148", 39, False),
    ("A12", "J06", "\u5224\u65ad", "\u4e2d\u7b49", ["\u70b8\u8c01"], "\u70b8\u4e0b\u5bb6\u540e\u7acb\u523b\u653e\u5c0f\u5355\u901a\u5e38\u662f\u597d\u9009\u62e9\u3002", "\u9519", 39, False),
    ("A13", "J06", "\u9009\u62e9", "\u5168\u9762", ["\u51fa\u70b8\u65f6\u673a"], "\u5c0f\u70b8\u591a\u4f46\u8d28\u91cf\u4e0d\u8db3\u65f6\u5e94\u600e\u6837\u7528\uff1f", "\u53ca\u65f6\u7528\uff0c\u522b\u62d6\u6b7b", 40, False),
    ("A14", "J07", "\u9009\u62e9", "\u5168\u9762", ["\u7528\u54ea\u4e2a\u70b8"], "\u540c\u65f6\u67092222\u548c33333\uff0c\u901a\u5e38\u5148\u7528\u54ea\u4e2a\uff1f", "33333\u5148\u7528", 42, False),
    ("A15", "J08", "\u9009\u62e9", "\u5168\u9762", ["\u4f18\u5316\u624b\u6570"], "\u54ea\u79cd\u7406\u724c\u66f4\u6709\u5229\u4e8e\u51cf\u5c11\u624b\u6570\uff1f", "\u9009\u62e9\u53ef\u56de\u6536\u3001\u53ef\u8fde\u7eed\u51fa\u7684\u5206\u7ec4", 44, False),
    ("A16", "J09", "\u5224\u65ad", "\u5168\u9762", ["\u62c6\u70b8"], "\u62c6\u70b8\u53ea\u4f1a\u524a\u5f31\u724c\u529b\uff0c\u51e0\u4e4e\u4e0d\u503c\u5f97\u3002", "\u9519", 46, False),
    ("A17", "J10", "\u9009\u62e9", "\u5168\u9762", ["\u4fdd\u7559\u5b9e\u529b"], "\u4e3b\u653b\u5f62\u6210\u51b2\u523a\u524d\uff0c\u70b8\u5f39\u5e94\u5982\u4f55\u4fdd\u7559\uff1f", "\u81f3\u5c11\u4fdd\u7559\u5173\u952e\u63a7\u5236\u70b8", 48, False),
    ("A18", "J11", "\u9009\u62e9", "\u5168\u9762", ["\u6b8b\u5c40\u5148\u70b8"], "\u6b8b\u5c40\u4e00\u822c\u4e3a\u4ec0\u4e48\u201c\u9022\u70b8\u4e3a\u5148\u201d\uff1f", "\u62a2\u4e3b\u52a8\u6743\u548c\u538b\u7f29\u654c\u65b9\u9009\u62e9", 50, False),
    ("A19", "J11", "\u5224\u65ad", "\u5168\u9762", ["\u9a97\u70b8"], "\u9a97\u70b8\u7684\u76ee\u6807\u53ea\u662f\u9a97\u6389\u5bf9\u65b9\u4e00\u70b8\u3002", "\u9519", 51, False),
    ("A20", "J12", "\u9009\u62e9", "\u4e2d\u7b49", ["\u7559\u98ce"], "\u7559\u98ce\u66f4\u5173\u6ce8\u4ec0\u4e48\uff1f", "\u5347\u7ea7\u5e45\u5ea6\u4e0e\u5c3e\u724c\u8d28\u91cf", 53, False),
    ("A21", "J13", "\u9009\u62e9", "\u4e2d\u7b49", ["\u52a9\u653b\u8d77\u624b"], "\u60c5\u51b5\u4e0d\u660e\u65f6\u52a9\u653b\u4e3a\u4ec0\u4e48\u5bf9\u5b50\u5148\u884c\uff1f", "\u4fa6\u5bdf\u3001\u63a7\u5236\u3001\u793a\u5f31", 66, False),
    ("A22", "J13", "\u5224\u65ad", "\u4e2d\u7b49", ["\u614e\u63a5\u5bf9\u5bb6"], "\u5bf9\u5bb6\u5148\u53d13+2\uff0c\u4f60\u901a\u5e38\u5e94\u8be5\u79ef\u6781\u63a5\u624b\u3002", "\u9519", 67, False),
    ("A23", "J13", "\u9009\u62e9", "\u5168\u9762", ["\u4e25\u9632\u5355\u5f20"], "\u5361\u4e0b\u5bb6\u9632\u5355\u5f20\u65f6\u9996\u7528\u4ec0\u4e48\u533a\u95f4\uff1f", "Q\u4f18\u5148\uff0cJ/K\u6b21\u4e4b\uff0c\u6700\u5c0f10", 69, False),
    ("A24", "J13", "\u5224\u65ad", "\u5168\u9762", ["\u521d\u671f\u4e0d\u70b8\u4e0b\u5bb6"], "\u52a9\u653b\u521d\u671f\u4e00\u822c\u4e0d\u70b8\u4e0b\u5bb6\uff0c\u662f\u56e0\u4e3a\u4e0b\u5bb6\u4e0d\u5371\u9669\u3002", "\u9519", 70, False),
    ("A25", "J14", "\u9009\u62e9", "\u5168\u9762", ["\u9001\u5bf9\u5bb6"], "\u7cbe\u51c6\u9001\u724c\u7684\u7b2c\u4e00\u539f\u5219\u662f\u4ec0\u4e48\uff1f", "\u987a\u5bf9\u5bb6\u610f\u613f\u4f18\u5148", 72, False),
    ("A26", "J14", "\u9009\u62e9", "\u5168\u9762", ["\u9001\u724c"], "\u731c\u4e0d\u51c6\u5bf9\u5bb6\u724c\u8def\u65f6\u6700\u540e\u4e00\u62db\u662f\u4ec0\u4e48\uff1f", "\u51fa\u4e0b\u5bb6\u5f31\u8def/\u4e0d\u5403\u8def", 73, False),
    ("A27", "J14", "\u5224\u65ad", "\u5168\u9762", ["\u9001\u542c\u4e0e\u8f6c\u4e3b\u653b"], "\u9001\u542c\u5fc5\u987b\u4e00\u6761\u8def\u8d70\u5230\u5e95\uff0c\u4e0d\u80fd\u8f6c\u4e3b\u653b\u3002", "\u9519", 75, False),
    ("A28", "J14", "\u9009\u62e9", "\u5168\u9762", ["\u8f6c\u4e3b\u653b"], "\u52a9\u653b\u8f6c\u4e3b\u653b\u7684\u65f6\u673a\u5927\u7ea6\u5728\u4ec0\u4e48\u65f6\u5019\uff1f", "\u5c40\u9762\u63a8\u8fdb\u5230\u7ea62/3\uff0c\u4e14\u539f\u4e3b\u653b\u5931\u52bf", 79, False),
    ("A29", "G01", "\u9009\u62e9", "\u5168\u9762", ["\u9022\u4eba\u914d"], "\u9022\u4eba\u914d\u5728\u4e3b\u653b\u4e2d\u901a\u5e38\u66f4\u4f18\u5148\u505a\u4ec0\u4e48\uff1f", "\u5e38\u4f18\u5148\u8865\u7f3a/\u964d\u624b\u6570\uff0c\u518d\u6743\u8861\u6210\u70b8", 93, False),
    ("A30", "G02", "\u5224\u65ad", "\u5168\u9762", ["\u62a4\u724c"], "\u6b8b\u5c40\u91cc\u6709\u70b8\u7684\u4e00\u65b9\u5929\u7136\u66f4\u5bb9\u6613\u62a4\u8d70\u8d58\u724c\u3002", "\u5bf9", 94, True),
    ("A31", "G04", "\u6b8b\u5c40\u6a21\u62df", "\u5168\u9762", ["\u6865\u724c"], "\u6865\u724c\u7684\u76ee\u6807\u66f4\u63a5\u8fd1\u54ea\u4e00\u79cd\uff1f", "\u4e3a\u81ea\u5df1\u56de\u6536\u6216\u4e3a\u961f\u53cb\u9001\u6865", 100, True),
    ("A32", "G05", "\u9009\u62e9", "\u5168\u9762", ["\u7ec4\u724c\u51fa\u5c3d"], "\u591a\u624b3+2\u65f6\uff0c\u4e00\u4e2a\u5408\u7406\u7b56\u7565\u662f\u4ec0\u4e48\uff1f", "\u5c0f3+2\u8bd5\u63a2\uff0c\u59273+2\u56de\u6536", 102, False),
    ("A33", "G06", "\u9009\u62e9", "\u5168\u9762", ["\u738b\u591a\u6218\u6cd5"], "\u738b\u591a\u65f6\uff0c\u5982\u679c\u4f60\u60f3\u8bf1\u70b8\uff0c\u5148\u51fa\u54ea\u5f20\u66f4\u5e38\u89c1\uff1f", "\u5f80\u5f80\u5148\u7528\u8f83\u5c0f\u63a7\u5236\u738b\u6253\u51fa\u4fe1\u606f", 104, False),
    ("A34", "G07", "\u5224\u65ad", "\u5168\u9762", ["\u65e0\u738b\u6218\u6cd5"], "\u65e0\u738b\u5c31\u4e00\u5b9a\u662f\u5f31\u724c\u3002", "\u9519", 106, False),
    ("A35", "G07", "\u9009\u62e9", "\u5168\u9762", ["\u5c11\u8f93\u5f53\u8d62"], "\u201c\u5c11\u8f93\u5f53\u8d62\u201d\u6700\u9002\u5408\u54ea\u79cd\u5c40\u9762\uff1f", "\u660e\u77e5\u96be\u6321\u5934\u6e38\uff0c\u5148\u4e89\u66f4\u5c0f\u635f\u5931", 107, False),
    ("A36", "G08", "\u5224\u65ad", "\u5168\u9762", ["\u653e\u4e00\u5bb6\u6253\u4e00\u5bb6"], "\u653e\u4e00\u5bb6\u6253\u4e00\u5bb6\u7b49\u4e8e\u65e0\u8111\u653e\u5bf9\u624b\u5934\u6e38\u3002", "\u9519", 108, False),
    ("A37", "G09", "\u9009\u62e9", "\u5168\u9762", ["\u8c01\u6253\u8c01\u6536"], "\u201c\u8c01\u6253\u8c01\u6536\u201d\u7684\u6838\u5fc3\u76ee\u7684\u662f\u4ec0\u4e48\uff1f", "\u51cf\u5c11\u624b\u6570\u5e76\u62ff\u56de\u53d1\u724c\u6743", 110, False),
    ("A38", "G09", "\u9009\u62e9", "\u5168\u9762", ["\u610f\u56fe\u963b\u65ad"], "\u963b\u65ad\u654c\u65b9\u56de\u6536\u610f\u56fe\u65f6\uff0c\u901a\u5e38\u4f18\u5148\u600e\u4e48\u505a\uff1f", "\u5148\u5927\u540e\u5c0f\uff0c\u5c3d\u91cf\u5c01\u9876\uff1b\u5fc5\u8981\u65f6\u76f4\u63a5\u5f00\u70b8", 112, False),
    ("A39", "G10", "\u9009\u62e9", "\u5168\u9762", ["\u5355\u5f20\u5361\u4f4d"], "\u5355\u5f20\u5361\u4f4d\u6700\u672c\u8d28\u7684\u76ee\u6807\u662f\u4ec0\u4e48\uff1f", "\u9632\u4e0b\u5bb6\u987a\u8d70\u5e76\u4fdd\u7559\u53d8\u5316", 114, False),
    ("A40", "G10", "\u5224\u65ad", "\u5168\u9762", ["\u591a\u6837\u6027\u4e0e\u7075\u6d3b\u6027"], "\u724c\u8def\u8d8a\u5355\u4e00\u8d8a\u5bb9\u6613\u8ba9\u81ea\u5df1\u987a\u724c\u3002", "\u9519", 121, False),
    ("A41", "G11", "\u9009\u62e9", "\u5168\u9762", ["\u4fe1\u606f\u6536\u653e"], "\u6536\u7d27\u4fe1\u606f\u65f6\uff0c\u54ea\u7c7b\u724c\u66f4\u9002\u5408\u660e\u724c\u5148\u51fa\uff1f", "\u5df2\u7ecf\u66b4\u9732\u7684\u4fe1\u606f\u724c", 126, False),
    ("A42", "G11", "\u5224\u65ad", "\u4e2d\u7b49", ["\u5fc3\u6001\u8bad\u7ec3"], "\u8f93\u724c\u540e\u7acb\u523b\u8d23\u602a\u961f\u53cb\u6709\u5229\u4e8e\u63d0\u5347\u80dc\u7387\u3002", "\u9519", 135, False),
    ("A43", "G12", "\u9009\u62e9", "\u4e2d\u7b49", ["\u98ce\u683c\u5206\u6790"], "\u98ce\u683c\u504f\u63a7\u5236\u578b\u65f6\u66f4\u6015\u4ec0\u4e48\uff1f", "\u88ab\u4f34\u653b\u6d88\u8017\u6216\u88ab\u8feb\u62c6\u8d44\u6e90", 138, False),
    ("A44", "G12", "\u5224\u65ad", "\u4e2d\u7b49", ["\u5ea7\u4f4d\u9009\u62e9"], "\u5ea7\u4f4d\u9009\u62e9\u4e0e\u4e0a\u4e0b\u5bb6\u5173\u7cfb\u65e0\u5173\u3002", "\u9519", 140, False),
    ("A45", "G13", "\u5224\u65ad", "\u4e2d\u7b49", ["\u793c\u4eea"], "\u8ff7\u60d1\u5bf9\u624b\u53ef\u4ee5\u9760\u660e\u663e\u8868\u60c5\u6216\u63d0\u524d\u6697\u53f7\u3002", "\u9519", 143, False),
    ("A46", "C05", "\u6b8b\u5c40\u6a21\u62df", "\u5168\u9762", ["\u4f595/6\u6b8b\u5c40"], "\u654c\u65b9\u4f595-6\u5f20\u65f6\uff0c\u9632\u5b88\u4f18\u5148\u5173\u6ce8\u4ec0\u4e48\uff1f", "\u5178\u578b\u5371\u9669\u7ec4\u5408\u4e0e\u542c\u724c\u5a01\u80c1", 130, True),
    ("A47", "C06", "\u9009\u62e9", "\u5168\u9762", ["\u4f597/8\u6b8b\u5c40"], "\u654c\u65b9\u4f597-8\u5f20\u65f6\uff0c\u9632\u5b88\u65b9\u66f4\u5e94\u907f\u514d\u4ec0\u4e48\uff1f", "\u5c0f\u5355\u3001\u5bf9\u5b50\u3001\u4e09\u4e0d\u5e26\u8fc7\u65e9\u9001\u51fa", 133, False),
    ("A48", "C07", "\u9009\u62e9", "\u5168\u9762", ["\u4f599/10\u6b8b\u5c40"], "\u654c\u65b9\u4f599-10\u5f20\u65f6\uff0c\u4ec0\u4e48\u7ed3\u6784\u66f4\u5371\u9669\uff1f", "3+2\u6216\u987a\u5b50\u578b\u7ec4\u5408", 134, False),
    ("A49", "C03", "\u6b8b\u5c40\u6a21\u62df", "\u5168\u9762", ["\u62a4\u724c", "\u963b\u6321"], "\u70b8\u5f39\u62a4\u724c\u6848\u4f8b\u4e2d\uff0c\u662f\u5426\u8be5\u7acb\u523b\u51c0\u5173\uff1f", "\u89c6\u662f\u5426\u5148\u6d88\u706d\u654c\u65b9\u706b\u529b", 94, True),
    ("A50", "G13", "\u9009\u62e9", "\u4e2d\u7b49", ["\u884c\u4e1a\u89c6\u91ce"], "\u539f\u4e66\u6700\u540e\u8ba8\u8bbaAI\u4e0e\u5e73\u53f0\uff0c\u653e\u8fdb\u7cfb\u7edf\u91cc\u6700\u9002\u5408\u8f6c\u6210\u4ec0\u4e48\uff1f", "\u4ea7\u54c1\u89c6\u91ce\u8bfe/\u7528\u6237\u6559\u80b2\u5185\u5bb9\uff0c\u800c\u975e\u57fa\u7840\u8bfe", 158, False),
]


def get_course(course_id: str) -> CourseSeed:
    return next(course for course in COURSE_SEEDS if course.id == course_id)


def option_set(question_type: str, answer: str, distractors: list[str] | None = None) -> list[dict[str, str]]:
    if question_type == "\u5224\u65ad":
        raw = ["\u5bf9", "\u9519"]
    elif distractors:
        raw = [answer, *distractors]
    elif question_type == "\u6b8b\u5c40\u6a21\u62df":
        raw = [answer, "\u53ea\u770b\u81ea\u5df1\u80fd\u5426\u4e00\u624b\u8d70\u5b8c", "\u8fc7\u724c\u7b49\u4e0b\u8f6e", "\u5148\u62c6\u6700\u5927\u724c\u538b\u4f4f"]
    else:
        raw = [answer, "\u53ea\u770b\u724c\u9762\u5927\u5c0f", "\u4f18\u5148\u4fdd\u7559\u6240\u6709\u5927\u724c", "\u968f\u673a\u51fa\u724c\u8bd5\u63a2"]
    seen: list[str] = []
    for item in raw:
        if item not in seen:
            seen.append(item)
    labels = ["A", "B", "C", "D"]
    return [{"id": labels[i].lower(), "label": labels[i], "text": text} for i, text in enumerate(seen[:4])]


def build_courses() -> list[dict[str, Any]]:
    course_ids = [course.id for course in COURSE_SEEDS]
    courses = []
    for index, seed in enumerate(COURSE_SEEDS):
        pages = [pdf_page(page) for page in seed.printed_pages if pdf_page(page)]
        primary_page = pages[0]
        assert primary_page is not None
        related_questions = [q[0] for q in SIMPLE_QUESTIONS if q[1] == seed.id] + [
            q[0] for q in FULL_QUESTION_SEEDS if q[1] == seed.id
        ]
        if not related_questions:
            related_questions = [f"D-{seed.id}"]
        asset_ids = [page_asset_id(page) for page in pages]
        courses.append(
            {
                "id": seed.id,
                "title": seed.title,
                "category": seed.category,
                "difficulty": seed.difficulty,
                "sourcePdf": SOURCE_TITLE,
                "sourceChapter": seed.source_chapter,
                "sourcePage": f"{min(pages)}-{max(pages)}" if len(pages) > 1 else str(primary_page),
                "sourcePages": pages,
                "sourcePrintedPages": seed.printed_pages,
                "knowledgePoints": seed.knowledge_points,
                "exampleImages": asset_ids[:3],
                "imageUsage": seed.example_usage,
                "mistakes": seed.mistakes,
                "exercises": related_questions,
                "aiReview": "PT-REVIEW",
                "contentBlocks": [
                    {
                        "type": "coach",
                        "text": f"\u8fd9\u8282\u8bfe\u5148\u628a\u300c{seed.knowledge_points[0]}\u300d\u53d8\u6210\u53ef\u5224\u65ad\u3001\u53ef\u7ec3\u4e60\u7684\u724c\u5c40\u80fd\u529b\u3002",
                    },
                    {
                        "type": "slogan",
                        "text": f"\u53e3\u8bc0\uff1a{seed.mistakes[0]}\u7684\u53cd\u9762\uff0c\u5c31\u662f\u672c\u8bfe\u8981\u7ec3\u7684\u5224\u65ad\u3002",
                    },
                    {
                        "type": "core",
                        "text": "\u5148\u770b\u89d2\u8272\u4e0e\u724c\u6743\uff0c\u518d\u770b\u724c\u9762\u5927\u5c0f\uff1b\u8bad\u7ec3\u91cd\u70b9\u662f\u505a\u51fa\u4e0b\u4e00\u624b\u9009\u62e9\u3002",
                    },
                    {
                        "type": "example",
                        "assetIds": asset_ids[:1],
                        "text": "\u4f18\u5148\u4f7f\u7528 PDF \u539f\u59cb\u9875\u9762\u4f5c\u4e3a\u6559\u5b66\u8bc1\u636e\uff0c\u540e\u7eed\u53ef\u5728\u8be5\u9875\u57fa\u7840\u4e0a\u505a\u5c40\u90e8\u5207\u56fe\u548c\u6807\u6ce8\u5c42\u3002",
                    },
                ],
                "assetIds": asset_ids,
                "questionIds": related_questions,
                "aiPromptIds": ["PT-COURSE", "PT-QUIZ", "PT-REVIEW"],
                "prerequisites": [course_ids[index - 1]] if index > 0 else [],
                "nextCourses": [course_ids[index + 1]] if index + 1 < len(course_ids) else [],
            }
        )
    return courses


def build_questions() -> list[dict[str, Any]]:
    questions = []
    for source in SIMPLE_QUESTIONS:
        qid, course_id, qtype, difficulty, tags, stem, answer, distractors, explanation, printed_page, requires_pdf = source
        page = pdf_page(printed_page) or 1
        options = option_set(qtype, answer, distractors)
        questions.append(
            {
                "id": qid,
                "assessment": "simple",
                "courseId": course_id,
                "type": qtype,
                "difficulty": difficulty,
                "tags": tags,
                "title": stem[:22],
                "question": stem,
                "image": {
                    "assetId": page_asset_id(page),
                    "usage": "\u9898\u76ee\u6765\u6e90\u9875\u539f\u56fe" if requires_pdf else "\u77e5\u8bc6\u70b9\u6765\u6e90\u9875",
                },
                "options": options,
                "correctAnswer": answer,
                "correctOptionId": next((option["id"] for option in options if option["text"] == answer), "a"),
                "wrongReasons": [explanation],
                "explanation": explanation,
                "aiCoachComment": "\u5148\u4e0d\u770b\u7b54\u6848\u5bf9\u9519\uff0c\u5148\u770b\u4f60\u7684\u5224\u65ad\u4f9d\u636e\u662f\u4e0d\u662f\u6765\u81ea\u724c\u6743\u3001\u89d2\u8272\u548c\u5269\u4f59\u624b\u6570\u3002",
                "recommendedCourse": course_id,
                "sourcePage": page,
                "sourcePrintedPage": printed_page,
                "requiresPdfImage": requires_pdf,
                "aiPromptId": "PT-REVIEW",
            }
        )
    for source in FULL_QUESTION_SEEDS:
        qid, course_id, qtype, difficulty, tags, stem, answer, printed_page, requires_pdf = source
        page = pdf_page(printed_page) or 1
        course = get_course(course_id)
        options = option_set(qtype, answer)
        explanation = f"\u8fd9\u9898\u8003\u7684\u662f\u300c{tags[0]}\u300d\uff0c\u63a8\u8350\u56de\u770b {course_id}\u300a{course.title}\u300b\u5bf9\u5e94 PDF \u9875\u3002"
        questions.append(
            {
                "id": qid,
                "assessment": "full",
                "courseId": course_id,
                "type": qtype,
                "difficulty": difficulty,
                "tags": tags,
                "title": stem[:22],
                "question": stem,
                "image": {
                    "assetId": page_asset_id(page),
                    "usage": "\u9898\u76ee\u724c\u5c40\u539f\u56fe" if requires_pdf else "\u77e5\u8bc6\u70b9\u6765\u6e90\u9875",
                },
                "options": options,
                "correctAnswer": answer,
                "correctOptionId": next((option["id"] for option in options if option["text"] == answer), "a"),
                "wrongReasons": [
                    "\u53ea\u770b\u724c\u9762\u5927\u5c0f\uff0c\u6ca1\u6709\u770b\u5f53\u524d\u89d2\u8272\u548c\u724c\u6743\u3002",
                    "\u628a\u4e00\u6b21\u80fd\u538b\u4f4f\u5f53\u6210\u5168\u5c40\u6700\u4f18\u89e3\u3002",
                ],
                "explanation": explanation,
                "aiCoachComment": "\u4f60\u7684\u9009\u62e9\u8981\u56de\u5230\u4e00\u4e2a\u95ee\u9898\uff1a\u8fd9\u624b\u724c\u6253\u5b8c\u540e\uff0c\u8c01\u66f4\u8212\u670d\uff1f",
                "recommendedCourse": course_id,
                "sourcePage": page,
                "sourcePrintedPage": printed_page,
                "requiresPdfImage": requires_pdf,
                "aiPromptId": "PT-REVIEW",
            }
        )
    covered_courses = {question["courseId"] for question in questions}
    for seed in COURSE_SEEDS:
        if seed.id in covered_courses:
            continue
        printed_page = seed.printed_pages[0]
        page = pdf_page(printed_page) or 1
        answer = f"\u5148\u5224\u65ad\u300c{seed.knowledge_points[0]}\u300d\uff0c\u518d\u7ed3\u5408\u89d2\u8272\u548c\u724c\u6743\u9009\u62e9\u4e0b\u4e00\u624b\u3002"
        options = option_set("\u9009\u62e9", answer)
        questions.append(
            {
                "id": f"D-{seed.id}",
                "assessment": "course-drill",
                "courseId": seed.id,
                "type": "\u9009\u62e9",
                "difficulty": seed.difficulty,
                "tags": seed.knowledge_points[:3],
                "title": f"{seed.title}\u8bfe\u540e\u5c0f\u7ec3",
                "question": f"\u5b66\u5b8c\u300a{seed.title}\u300b\u540e\uff0c\u9047\u5230\u540c\u7c7b\u724c\u5c40\u5e94\u5148\u770b\u4ec0\u4e48\uff1f",
                "image": {
                    "assetId": page_asset_id(page),
                    "usage": "\u8bfe\u540e\u7ec3\u4e60\u6765\u6e90\u9875",
                },
                "options": options,
                "correctAnswer": answer,
                "correctOptionId": "a",
                "wrongReasons": [
                    seed.mistakes[0],
                    "\u6ca1\u6709\u628a PDF \u4e2d\u7684\u6982\u5ff5\u8f6c\u6210\u53ef\u6267\u884c\u5224\u65ad\u3002",
                ],
                "explanation": f"\u8fd9\u9898\u7528\u4e8e\u786e\u8ba4\u300a{seed.title}\u300b\u7684\u6838\u5fc3\u5224\u65ad\u662f\u5426\u5df2\u7ecf\u5efa\u7acb\u3002",
                "aiCoachComment": "\u5148\u627e\u51fa\u8fd9\u624b\u724c\u7684\u4e3b\u8981\u77db\u76fe\uff0c\u518d\u9009\u62e9\u51fa\u724c\u3002\u4e0d\u8981\u53ea\u51ed\u724c\u9762\u5927\u5c0f\u505a\u51b3\u7b56\u3002",
                "recommendedCourse": seed.id,
                "sourcePage": page,
                "sourcePrintedPage": printed_page,
                "requiresPdfImage": True,
                "aiPromptId": "PT-REVIEW",
            }
        )
    return questions


def build_learning_path(courses: list[dict[str, Any]]) -> dict[str, Any]:
    groups: dict[str, list[dict[str, Any]]] = {}
    for course in courses:
        groups.setdefault(course["category"], []).append(course)
    stages = []
    for index, category in enumerate(["\u57fa\u7840\u5165\u95e8", "\u8fdb\u9636\u6280\u5de7", "\u9ad8\u624b\u4f53\u7cfb", "\u6b8b\u5c40\u8bad\u7ec3"], 1):
        stage_courses = groups[category]
        stages.append(
            {
                "id": slugify(category),
                "order": index,
                "title": category,
                "goal": {
                    "\u57fa\u7840\u5165\u95e8": "\u5efa\u7acb\u89c4\u5219\u3001\u724c\u578b\u3001\u724c\u529b\u548c\u89d2\u8272\u5206\u5de5\u7684\u5171\u540c\u8bed\u8a00\u3002",
                    "\u8fdb\u9636\u6280\u5de7": "\u89e3\u51b3\u4e3b\u653b\u3001\u52a9\u653b\u3001\u51fa\u70b8\u548c\u4f18\u5316\u624b\u6570\u7684\u6838\u5fc3\u80dc\u7387\u95ee\u9898\u3002",
                    "\u9ad8\u624b\u4f53\u7cfb": "\u8bad\u7ec3\u8bfb\u5c40\u3001\u63a7\u8282\u594f\u3001\u505a\u53d6\u820d\u7684\u9ad8\u9636\u5fc3\u667a\u3002",
                    "\u6b8b\u5c40\u8bad\u7ec3": "\u628a PDF \u724c\u5c40\u4f8b\u5b50\u8f6c\u6210\u53ef\u91cd\u590d\u7ec3\u7684\u9009\u62e9\u9898\u548c\u6a21\u62df\u9898\u3002",
                }[category],
                "courseIds": [course["id"] for course in stage_courses],
                "entryTest": "simple-assessment" if index == 1 else None,
                "exitTest": "full-assessment" if index == 4 else f"{slugify(category)}-stage-review",
            }
        )
    return {
        "id": "commercial-ai-guandan-path",
        "title": "\u5546\u4e1a\u7ea7 AI \u63bc\u86cb\u6210\u957f\u8bad\u7ec3\u8def\u7ebf",
        "sourcePdf": SOURCE_TITLE,
        "principle": "PDF \u5148\u6210\u4e3a source of truth\uff0c\u518d\u751f\u6210\u8bfe\u7a0b\u3001\u9898\u5e93\u3001\u56fe\u7247\u6807\u6ce8\u548c AI \u590d\u76d8\u3002",
        "flow": ["simple-assessment", "\u57fa\u7840\u5165\u95e8", "\u8fdb\u9636\u6280\u5de7", "\u9ad8\u624b\u4f53\u7cfb", "\u6b8b\u5c40\u8bad\u7ec3", "full-assessment", "ai-review-report", "personal-remediation"],
        "stages": stages,
        "assessmentEntrances": [
            {
                "id": "simple-assessment",
                "title": "\u7b80\u5355\u80fd\u529b\u6d4b\u8bd5",
                "questionCount": len([q for q in SIMPLE_QUESTIONS]),
                "goal": "\u5feb\u901f\u5224\u65ad\u7528\u6237\u662f\u5148\u8865\u89c4\u5219\u3001\u4e3b\u653b\u3001\u52a9\u653b\u8fd8\u662f\u6b8b\u5c40\u3002",
                "coverage": ["\u89c4\u5219", "\u724c\u578b", "\u7b80\u5355\u5224\u65ad", "\u4e3b\u653b/\u52a9\u653b"],
            },
            {
                "id": "full-assessment",
                "title": "\u5168\u9762\u80fd\u529b\u6d4b\u8bd5",
                "questionCount": len([q for q in FULL_QUESTION_SEEDS]),
                "goal": "\u751f\u6210\u80fd\u529b\u753b\u50cf\u3001\u9519\u9898\u6807\u7b7e\u548c\u4e2a\u6027\u5316\u8def\u7ebf\u3002",
                "coverage": ["\u724c\u529b\u5224\u65ad", "\u70b8\u5f39\u4f7f\u7528", "\u4e3b\u653b\u7b56\u7565", "\u52a9\u653b\u7b56\u7565", "\u8bb0\u724c", "\u6b8b\u5c40"],
            },
        ],
    }


PROMPTS = [
    {
        "id": "PT-COURSE",
        "name": "\u8bfe\u7a0b\u6587\u6848\u751f\u6210",
        "task": "\u628a PDF \u7bc7\u7ae0\u4e0e\u8bfe\u7a0b\u5143\u6570\u636e\u8f6c\u6210\u8bfe\u7a0b\u9875\u6587\u6848",
        "inputFields": ["course_title", "course_goal", "tags", "source_pages", "asset_descriptions", "tone"],
        "template": "\u4f60\u662f\u63bc\u86cb\u8bfe\u7a0b\u7f16\u8f91\u5668\u3002\u57fa\u4e8e\u8bfe\u7a0b\u6807\u9898\u3001\u6559\u5b66\u76ee\u6807\u3001\u6807\u7b7e\u3001PDF\u53c2\u8003\u9875\u548c\u53ef\u7528\u7d20\u6750\uff0c\u751f\u6210\u9002\u7528\u4e8e\u5728\u7ebf\u5b66\u4e60\u7cfb\u7edf\u7684\u77ed\u8bfe\u7a0b\u6587\u6848\u3002\u5fc5\u987b\u56f4\u7ed5 PDF \u5185\u5bb9\uff0c\u4e0d\u8981\u53d1\u660e\u89c4\u5219\u3002",
        "outputSpec": ["80-120\u5b57\u5bfc\u8bed", "3-5\u4e2a\u6838\u5fc3\u6982\u5ff5", "\u5e38\u89c1\u8bef\u533a", "\u4e00\u53e5\u8bdd\u603b\u7ed3", "2\u9053\u7ec3\u4e60\u5efa\u8bae"],
    },
    {
        "id": "PT-VISUAL",
        "name": "\u793a\u4f8b\u56fe\u4e0e\u6807\u6ce8\u8bf4\u660e",
        "task": "\u628a PDF \u539f\u56fe\u8f6c\u4e3a\u8bfe\u7a0b\u56fe\u6216\u8f7b\u52a8\u753b\u5206\u955c\u8bf4\u660e",
        "inputFields": ["course_title", "scene_type", "page_ref", "focus_tags", "need_annotation"],
        "template": "\u4f60\u662f\u63bc\u86cb\u6559\u5b66\u53ef\u89c6\u5316\u8bbe\u8ba1\u5e08\u3002\u8bf7\u4f18\u5148\u57fa\u4e8e PDF \u539f\u56fe\u8f93\u51fa\u9759\u6001\u56fe\u8bf4\u660e\u62164\u5e27\u8f7b\u52a8\u753b\u8bf4\u660e\u3002\u7981\u6b62\u6539\u52a8\u539f\u724c\u578b\u903b\u8f91\u3002",
        "outputSpec": ["\u753b\u9762\u76ee\u6807", "\u5143\u7d20\u6e05\u5355", "\u5361\u724c\u6392\u5e03", "\u6587\u5b57\u6807\u6ce8", "Frame1-Frame4"],
    },
    {
        "id": "PT-QUIZ",
        "name": "\u81ea\u52a8\u51fa\u9898",
        "task": "\u4e3a\u8bfe\u7a0b\u751f\u6210\u9898\u76ee\u6216\u6d4b\u8bd5\u9898",
        "inputFields": ["course_id", "question_count", "question_types", "difficulty_mix", "must_use_pdf_assets"],
        "template": "\u4f60\u662f\u63bc\u86cb\u9898\u5e93\u751f\u6210\u5668\u3002\u8bf7\u4e3a\u8bfe\u7a0b\u751f\u6210\u9898\u76ee\uff0c\u8f93\u51fa JSON \u6570\u7ec4\u3002\u82e5 must_use_pdf_assets=true\uff0c\u5fc5\u987b\u5f15\u7528 assets.json \u4e2d source=pdf \u7684\u7d20\u6750\u3002\u7981\u6b62\u53d1\u660e\u4e66\u4e2d\u6ca1\u6709\u7684\u89c4\u5219\u3002",
        "outputSpec": ["id", "type", "difficulty", "stem", "options", "answer", "explanation", "aiReviewPoints", "requiresPdfImage", "cropSpec"],
    },
    {
        "id": "PT-REVIEW",
        "name": "AI \u590d\u76d8\u70b9\u8bc4",
        "task": "\u5bf9\u7528\u6237\u7b54\u9898\u6216\u6b8b\u5c40\u6a21\u62df\u505a\u7ed3\u6784\u5316\u70b9\u8bc4",
        "inputFields": ["user_action", "correct_action", "tags", "mistake_type", "next_lesson"],
        "template": "\u4f60\u662f\u63bc\u86cbAI\u590d\u76d8\u6559\u7ec3\u3002\u8bf7\u6839\u636e\u7528\u6237\u884c\u4e3a\u4e0e\u6807\u51c6\u7b54\u6848\uff0c\u8f93\u51fa\u7b80\u6d01\u4f46\u6709\u884c\u52a8\u6307\u5bfc\u7684\u590d\u76d8\u3002\u4e0d\u8981\u957f\u7bc7\u8bb2\u89c4\u5219\uff0c\u8981\u6307\u51fa\u4e0b\u4e00\u6b21\u5148\u770b\u4ec0\u4e48\u3002",
        "outputSpec": ["\u4e00\u53e5\u8bdd\u70b9\u8bc4", "\u4f60\u9519\u5728\u4ec0\u4e48\u5224\u65ad", "\u4e0b\u6b21\u5148\u770b\u4ec0\u4e48", "\u63a8\u8350\u56de\u770b\u54ea\u4e00\u8bfe"],
    },
    {
        "id": "PT-PATH",
        "name": "\u5b66\u4e60\u8def\u5f84\u63a8\u8350",
        "task": "\u6839\u636e\u6d4b\u8bd5\u7ed3\u679c\u81ea\u52a8\u63a8\u8350\u8bfe\u7a0b\u8def\u7ebf",
        "inputFields": ["profile_scores", "wrong_tags", "phase", "time_budget"],
        "template": "\u4f60\u662f\u63bc\u86cb\u5b66\u4e60\u8def\u5f84\u63a8\u8350\u5668\u3002\u8bf7\u6839\u636e\u7528\u6237\u753b\u50cf\uff0c\u8f93\u51fa\u672a\u67657\u5929\u621614\u5929\u5b66\u4e60\u987a\u5e8f\u3002\u8981\u5148\u8bca\u65ad\uff0c\u518d\u63a8\u8bfe\uff0c\u6700\u540e\u7ed9\u590d\u6d4b\u5efa\u8bae\u3002",
        "outputSpec": ["\u603b\u8bca\u65ad", "3\u4e2a\u4f18\u5148\u8865\u8bfe\u4e3b\u9898", "\u6bcf\u4e2a\u4e3b\u98982-3\u95e8\u8bfe", "\u5b66\u4e60\u987a\u5e8f\u539f\u56e0", "\u590d\u6d4b\u5efa\u8bae"],
    },
]


def render_pdf_pages() -> list[dict[str, Any]]:
    PAGE_ASSET_DIR.mkdir(parents=True, exist_ok=True)
    pdf = pdfium.PdfDocument(str(SOURCE_PDF))
    assets = []
    course_by_page: dict[int, str] = {}
    topic_by_page: dict[int, str] = {}
    for course in COURSE_SEEDS:
        for printed in course.printed_pages:
            page = pdf_page(printed)
            if page is None:
                continue
            course_by_page.setdefault(page, course.id)
            topic_by_page.setdefault(page, course.knowledge_points[0])

    for index in range(len(pdf)):
        page_no = index + 1
        output = PAGE_ASSET_DIR / f"gd_p{page_no:03d}_source-fullpage_main_v01.webp"
        if not output.exists():
            page = pdf[index]
            bitmap = page.render(scale=1.5)
            image = bitmap.to_pil().convert("RGB")
            image.save(output, "WEBP", quality=82, method=6)
        digest = hashlib.sha256(output.read_bytes()).hexdigest()[:16]
        bound_course = course_by_page.get(page_no)
        if not bound_course:
            if page_no <= 8:
                bound_course = "B01"
            elif page_no <= 29:
                bound_course = "B10"
            elif page_no <= 79:
                bound_course = "J14"
            elif page_no <= 92:
                bound_course = "B12"
            elif page_no <= 134:
                bound_course = "G10"
            else:
                bound_course = "G13"
        topic = topic_by_page.get(page_no, get_course(bound_course).knowledge_points[0])
        assets.append(
            {
                "id": page_asset_id(page_no),
                "source": "pdf",
                "sourceType": "pdf-fullpage",
                "pdfFileId": PDF_FILE_ID,
                "page": page_no,
                "printedPage": page_no - 2 if page_no > 2 else None,
                "topic": topic,
                "usage": "\u6e90PDF\u5168\u9875\u8bc1\u636e\u56fe\uff0c\u53ef\u7528\u4e8e\u8bfe\u7a0b\u539f\u56fe\u3001\u9898\u76ee\u539f\u56fe\u6216\u540e\u7eed\u88c1\u526a\u57fa\u51c6",
                "course": bound_course,
                "question": None,
                "src": page_asset_src(page_no),
                "file": output.name,
                "sourceVerified": True,
                "qualityStatus": "web-ready-derivative",
                "sha256": digest,
                "deletePolicy": "keep: pdf source page bound to course",
            }
        )
    return assets


def bind_question_assets(assets: list[dict[str, Any]], questions: list[dict[str, Any]]) -> None:
    page_records = {asset["id"]: asset for asset in assets}
    for question in questions:
        asset_id = question["image"]["assetId"]
        if asset_id not in page_records:
            continue
        page_asset = page_records[asset_id]
        question_asset = dict(page_asset)
        question_asset["id"] = f"{asset_id}-{question['id'].lower()}"
        question_asset["usage"] = question["image"]["usage"]
        question_asset["course"] = question["courseId"]
        question_asset["question"] = question["id"]
        question_asset["deletePolicy"] = "keep: question-bound pdf source image"
        assets.append(question_asset)
        question["image"]["assetId"] = question_asset["id"]


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if not SOURCE_PDF.exists():
        raise FileNotFoundError(SOURCE_PDF)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    courses = build_courses()
    questions = build_questions()
    assets = render_pdf_pages()
    bind_question_assets(assets, questions)
    learning_path = build_learning_path(courses)

    write_json(OUTPUT_DIR / "courses.json", courses)
    write_json(OUTPUT_DIR / "questions.json", questions)
    write_json(OUTPUT_DIR / "assets.json", assets)
    write_json(OUTPUT_DIR / "learning-path.json", learning_path)
    write_json(OUTPUT_DIR / "ai-review-prompts.json", PROMPTS)
    write_json(
        OUTPUT_DIR / "source-scan.json",
        {
            "sourcePdf": str(SOURCE_PDF),
            "pdfFileId": PDF_FILE_ID,
            "pagesScanned": 162,
            "textLayer": "empty/scanned-image",
            "renderedPageAssets": 162,
            "courseCount": len(courses),
            "questionCount": len(questions),
            "assetCount": len(assets),
            "notes": [
                "\u6e90 PDF \u662f\u626b\u63cf\u578b\uff0c\u6587\u672c\u5c42\u57fa\u672c\u4e3a\u7a7a\uff0c\u56e0\u6b64\u672c\u6b21\u4ee5\u5168\u9875\u6e32\u67d3\u56fe\u4f5c\u4e3a\u539f\u59cb\u8bc1\u636e\u8d44\u4ea7\u3002",
                "\u8bfe\u7a0b\u4e0e\u9898\u5e93\u7ed3\u6784\u6765\u81ea\u300a\u5c06\u63bc\u86cb\u6280\u5de7\u79d8\u7c4d\u8f6c\u5316\u4e3a\u5546\u4e1a\u7ea7\u5728\u7ebf\u5b66\u4e60\u7cfb\u7edf\u7684\u5b8c\u6574\u65b9\u6848\u300b\u4e2d\u7684\u84dd\u56fe\u3002",
                "sourcePage \u4f7f\u7528 PDF \u6587\u4ef6\u9875\u7801\uff1bsourcePrintedPage \u4fdd\u7559\u539f\u4e66\u5370\u5237\u9875\u7801\u4f30\u7b97\uff08\u6587\u4ef6\u9875\u7ea6\u7b49\u4e8e\u5370\u5237\u9875+2\uff09\u3002",
            ],
        },
    )
    print(
        json.dumps(
            {
                "courses": len(courses),
                "questions": len(questions),
                "assets": len(assets),
                "output": str(OUTPUT_DIR),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
