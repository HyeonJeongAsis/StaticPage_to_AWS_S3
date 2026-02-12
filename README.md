# githubaction

 

### 1단계: AWS S3 버킷 설정  

HTML 때와 똑같이 **S3 버킷을 생성하고 권한을 열어둬야 합니다.**

1. **버킷 생성:** (예: `my-react-library-2024`)
2. **속성:** 정적 웹 호스팅 활성화.
3. **권한 (퍼블릭 액세스 차단):** 모든 차단 해제.
4. **권한 (버킷 정책):** 아래 정책 붙여넣기.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::내-버킷-이름/*"
        }
    ]
}

```

---

### 2단계: GitHub Secrets 등록 (Academy 토큰 3개)

Academy 환경이므로 세션 토큰이 포함된 3가지 값을 GitHub 저장소 **Settings > Secrets and variables > Actions**에 등록합니다. (세션이 만료되었다면 [AWS Details]에서 다시 복사해야 합니다!)

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_SESSION_TOKEN` (필수!)

---

### 3단계: GitHub Actions 워크플로우 작성 (`deploy.yml`)

React를 빌드하기 위해 `Node.js`를 설치하고 `npm run build`를 실행하는 단계가 추가되었습니다. 기존 파일을 아래 내용으로 덮어쓰세요.

**경로:** `.github/workflows/deploy.yml`

```yaml
name: Deploy React to S3 (Academy)

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    # 1. 소스 코드 가져오기
    - name: Checkout source code
      uses: actions/checkout@v4

    # 2. Node.js 설치 (React 빌드용)
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20' # 최신 LTS 버전 사용
        cache: 'npm'       # npm 패키지 설치 속도 향상

    # 3. 의존성 패키지 설치
    - name: Install Dependencies
      run: npm install

    # 4. React 프로젝트 빌드 (HTML/CSS/JS 변환)
    - name: Build
      run: npm run build
      # 설명: 이 명령어가 실행되면 './build' 폴더에 배포용 파일들이 생성됩니다.

    # 5. AWS 자격 증명 설정 (Academy용 Session Token 포함)
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-session-token: ${{ secrets.AWS_SESSION_TOKEN }}
        aws-region: us-east-1 # Academy 리전 (보통 us-east-1)

    # 6. S3로 배포 (빌드된 폴더만 업로드)
    - name: Deploy to S3
      run: |
        # ./build 폴더의 내용을 S3로 동기화합니다.
        aws s3 sync ./build s3://내-버킷-이름 --delete

```

> **수정할 부분:** `s3://내-버킷-이름` 부분을 본인이 생성한 S3 버킷 이름으로 꼭 변경해주세요.

---

### 4단계: 배포 및 확인

1. 코드를 GitHub에 `push` 합니다.
2. **Actions** 탭에서 `Build` 단계와 `Deploy` 단계가 성공하는지 확인합니다.
3. S3 버킷의 **정적 웹 사이트 호스팅 엔드포인트** 주소로 접속합니다.

### 💡 주의사항 (React 배포 시 자주 겪는 문제)

1. **화면이 하얗게 나와요?**
* `package.json` 파일을 열어 `homepage` 속성이 잘못 설정되어 있는지 확인하세요. S3 루트 경로에 배포할 때는 아예 없거나 `.`으로 설정되어야 합니다.


```json
// package.json
{
  "name": "library-system",
  "version": "0.1.0",
  "homepage": ".",  // 혹은 이 줄을 아예 삭제
  ...
}

```


2. **새로고침하면 404 에러가 떠요?**
* SPA(Single Page Application) 특성상 발생하는 문제입니다. S3 정적 웹 호스팅 설정에서 **오류 문서(Error document)** 항목에도 `index.html`을 입력해주면 해결됩니다. (모든 요청을 index.html로 보내서 React 라우터가 처리하게 하는 방식입니다.)
 
