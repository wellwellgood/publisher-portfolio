# 김기윤 | Frontend Developer Portfolio

프론트엔드 개발자 김기윤의 소개, 기술 역량, 개발 철학과 프로젝트를 담은 개인 포트폴리오 웹사이트입니다. HTML, CSS, JavaScript로 구현한 단일 페이지이며, 어두운 배경과 민트색 포인트를 중심으로 반응형 화면을 구성했습니다.

## 주요 기능

- **Home**: 개발자 소개와 HTML/CSS로 구성한 대시보드·채팅·파일·메일 화면 목업
- **Profile**: 프로필 이미지, 인적 사항, 학력 및 경력 소개
- **Skills**: 기술별 숙련도 표시와 스크롤 진입 시 진행 막대 애니메이션
- **My Approach**: 사용자 중심 설계, 반응형 웹, 클린 코드, 지속적 학습에 대한 소개
- **Projects**: 프로젝트 카드와 외부 서비스 연결
- **탐색 및 인터랙션**: 고정 헤더, 부드러운 섹션 이동, 현재 섹션 메뉴 강조, 모바일 메뉴, 스크롤 등장 효과

첫 화면의 작업 화면은 소개용 목업입니다. 실제 채팅·파일 관리·메일 기능은 이 저장소에 구현되어 있지 않습니다.

## 사용 기술

- **HTML5**: 시맨틱 태그 기반 페이지 구성
- **CSS3**: CSS 변수, Grid/Flexbox, 미디어 쿼리, 전환 효과
- **JavaScript**: 모바일 메뉴 제어 및 `IntersectionObserver` 기반 스크롤 인터랙션
- **Devicon**: jsDelivr CDN을 통해 불러오는 기술 아이콘

페이지에 표시된 React, TypeScript, Node.js 등의 기술은 개인 역량 또는 소개 프로젝트의 기술입니다. 이 포트폴리오 자체는 별도 프레임워크나 빌드 도구 없이 동작합니다.

## 실행 방법

### 브라우저에서 바로 열기

저장소를 내려받은 뒤 `index.html`을 브라우저에서 엽니다. 패키지 설치, 빌드, 환경 변수 설정은 필요하지 않습니다.

```bash
git clone https://github.com/wellwellgood/publisher-portfolio.git
cd publisher-portfolio
```

### 로컬 서버로 실행하기

Python 3가 설치되어 있다면 프로젝트 폴더에서 다음 명령을 실행합니다.

```bash
python3 -m http.server 8000
```

브라우저에서 [http://localhost:8000](http://localhost:8000)에 접속합니다. 서버 종료는 터미널에서 `Ctrl+C`를 누릅니다.

> 기술 아이콘은 외부 CDN에서 불러오므로 정상 표시를 위해 인터넷 연결이 필요합니다.

## 폴더 구조

```text
.
├── index.html       # 기본 진입 페이지
├── Web.html         # index.html과 유사한 별도 HTML 페이지
├── Web.css          # 공통 스타일 및 반응형 레이아웃
├── Web.js           # 메뉴, 스크롤 감지, 등장 및 숙련도 애니메이션
├── reset.css        # 별도 리셋 스타일 파일 (현재 HTML에서 불러오지 않음)
├── img/
│   ├── profill.png  # 프로필 이미지
│   └── img.png      # 추가 이미지 에셋
└── README.md
```

`index.html`을 기본 진입점으로 사용합니다. `Web.html`도 같은 CSS와 JavaScript를 사용하지만, 현재 Dashboard Project 링크 경로가 다릅니다. 두 페이지를 함께 유지한다면 콘텐츠 수정 시 함께 확인해야 합니다.

## 콘텐츠 수정

- **소개·프로필·프로젝트**: `index.html`의 해당 섹션을 수정합니다.
- **프로필 이미지**: `img/profill.png`를 교체하거나 HTML의 이미지 경로를 변경합니다.
- **색상**: `Web.css` 상단 `:root`의 `--bg`, `--panel`, `--mint`, `--text` 등 변수를 수정합니다.
- **반응형 화면**: `Web.css`의 1050px, 760px, 480px 기준 미디어 쿼리를 수정합니다.
- **숙련도**: 기술 항목의 `data-level` 값과 화면에 표시되는 `<em>`의 백분율을 함께 수정합니다.
- **연락처·외부 링크**: 헤더, 프로필, 프로젝트 카드, 푸터에 있는 주소를 확인합니다.

## 소개 프로젝트

아래 설명과 링크는 현재 페이지에 등록된 내용을 기준으로 합니다.

- **[Dashboard Project](https://dashboardkky.netlify.app/)**: 차트, 메일, 파일 관리 기능을 소개하는 웹 대시보드 프로젝트. 표시 기술: React, Node.js, Socket.IO.
- **[Toss Clone](https://tosscloneweb.netlify.app/Home)**: 주식, 쇼핑, 혜택 기능을 소개하는 모바일 토스 클론 프로젝트. 표시 기술: React, Zustand, Express.
- **Portfolio**: 현재 저장소의 개인 포트폴리오 웹사이트. 사용 기술: HTML, CSS, JavaScript.

## 배포

정적 사이트 호스팅에 `index.html`, `Web.css`, `Web.js`, `img/`를 같은 상대 경로 구조로 업로드하면 됩니다. 별도 빌드 명령이나 백엔드 서버는 필요하지 않습니다.

배포 전에는 다음 항목을 확인합니다.

- 헤더의 `Contact Me` 이메일과 프로필·푸터 이메일이 서로 달라, 실제 사용할 주소로 통일해야 합니다.
- `전체 프로젝트 보기`는 현재 Netlify 관리 페이지로 연결됩니다. 방문자가 볼 수 있는 공개 페이지로 연결할지 확인합니다.
- 모바일 메뉴, 섹션 이동, 스크롤 애니메이션, 이미지 및 외부 프로젝트 링크가 정상 동작하는지 브라우저에서 확인합니다.

현재 저장소에는 자동화된 테스트나 빌드 스크립트가 없습니다.

## 작성자

**김기윤** · [GitHub](https://github.com/wellwellgood)
