# 다른 PC 로 옮기기

깃 원격을 못 쓸 때. 압축본 두 개를 만들어 뒀습니다 (`../player-growth-*.tar.gz`).

| 파일 | 크기 | 언제 |
|---|---|---|
| `player-growth-code.tar.gz` | **2.3MB** | 보통은 이것. 코드 + 잘라 놓은 스프라이트 + 문서 + 도구 |
| `player-growth-full.tar.gz` | **65MB** | 아트를 **다시 자를** 때. 위 + Gemini 원본 시트 전부 |

`node_modules`(380MB)와 `.expo` 는 뺐습니다 — 새 PC 에서 다시 받아야 합니다.
플랫폼별 바이너리가 섞여 있어서 그대로 옮기면 오히려 깨집니다.

## 옮기는 법

USB · AirDrop · 사내 드라이브 아무거나. 2.3MB 면 메신저로도 넘어갑니다.
같은 네트워크에 있고 ssh 가 되면:

```bash
scp ../player-growth-code.tar.gz 사용자@새PC:~/
```

## 새 PC 에서 복원

```bash
tar -xzf player-growth-code.tar.gz
cd player-growth
npm install          # 3~5분
npx expo start
```

필요한 것: **Node 20 이상**. `bun` 은 스모크/시뮬레이션 스크립트에만 쓰므로 없어도
앱은 돌아갑니다 (있으면 `bun src/core/__smoke__.ts` 로 632건 검증 가능).

⚠ **`babel.config.js` 를 만들지 마세요.** Expo SDK 57 은 이 파일이 있으면
`babel-preset-expo` 를 못 찾아 번들 전체가 실패합니다. 지금 없는 게 정상입니다.

## 잘 옮겨졌는지 확인

```bash
npx tsc --noEmit                      # 타입 통과
bun src/core/__smoke__.ts             # "전부 통과"
npx expo export --platform ios        # 번들 성공
```

## code 본으로 못 하는 것

`python3 tools/slice.py` (스프라이트 재슬라이스). 원본 시트가 `assets/lending-image`
등에 있는데 code 본에는 빠져 있습니다. 아트를 다시 자를 일이 있으면 full 본을 쓰세요.
이미 잘린 결과(`assets/sprites`, 70세트)는 code 본에도 들어 있어서 앱 실행은 됩니다.

## 돌아올 때

새 PC 에서 작업한 뒤 같은 방식으로 되가져오면 됩니다.

```bash
tar --exclude=node_modules --exclude=.expo -czf player-growth-code.tar.gz player-growth
```
