# 김기윤 | Frontend Developer Portfolio

김기윤의 프로필, 기술 역량, 개발 철학과 프로젝트를 소개하는 반응형 포트폴리오입니다.

## 디자인과 기능

- 첫 화면 영역에 한정된 영상 배경과 흰색 타이포그래피
- 3줄 소개 제목과 120ms 간격의 단어별 등장 애니메이션
- 프로필·기술·개발 철학·프로젝트로 이동하는 내비게이션
- 이메일 문의와 프로젝트 바로가기
- 스크롤 등장 효과 및 기술 숙련도 막대
- 작은 화면에서는 두 줄 헤더로 전환하며, 모션 감소 설정에서는 등장 애니메이션을 생략하고 영상 대신 정지 이미지 표시

## 실행

`index.html`을 브라우저에서 열면 됩니다. 패키지 설치나 빌드는 필요하지 않습니다. Python 3가 있다면 프로젝트 폴더에서 `python3 -m http.server 8000`을 실행한 뒤 http://localhost:8000 에 접속할 수도 있습니다.

Tailwind CSS CDN, Google Fonts의 Inter, Devicon 아이콘은 인터넷 연결이 필요합니다. 배경 영상은 로컬 `media/` 폴더에서 불러옵니다. 영상이 표시되지 않으면 어두운 배경이 유지됩니다.

## 파일 구성

- `index.html`: 페이지 콘텐츠와 구조를 담은 기본 HTML
- `Web.html`: 기본 페이지와 같은 내용을 제공하는 기존 진입 파일
- `media/kiyun-studio-knight-rider-mint.mp4`: 민트 LED 나이트 라이더 배경 영상
- `media/kiyun-studio-poster.png`: 영상 로딩 전 표시 이미지
- `img/profill.png`: 보관된 원본 프로필 이미지 (About Me에는 표시하지 않음)
- `Web.css`: 두 HTML 페이지가 공통으로 사용하는 스타일과 반응형 레이아웃
- `Web.js`: 제목 등장 효과와 스크롤 애니메이션
- `reset.css`: 보관된 기존 리셋 스타일 (현재 불러오지 않음)

## 수정 및 배포

페이지 내용은 HTML, 스타일은 `Web.css`, 애니메이션은 `Web.js`에서 수정합니다. `index.html`과 `Web.html`을 함께 유지한다면 두 파일에 동일하게 반영합니다. 정적 호스팅에는 HTML, `Web.css`, `Web.js`와 `media/`, `img/`를 같은 상대 경로로 업로드합니다.

연락 버튼은 기존 프로필 이메일을 사용하고, 전체 프로젝트 링크는 공개 GitHub 저장소 목록으로 연결합니다. 프로젝트 카드의 Dashboard Project 및 Toss Clone 링크는 기존 내용을 유지합니다.

## 작성자

김기윤 · [GitHub](https://github.com/wellwellgood)
