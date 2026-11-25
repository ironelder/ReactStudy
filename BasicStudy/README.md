# ReactStudy

TypeScript 기본 문법부터 Promise, `useState`, `useEffect`까지 **학습 모드(설명 → 연습 문제 → 채점·피드백)** 로 공부한 기록입니다. 다른 컴퓨터에서도 이어서 공부할 수 있게 강의 본문, 연습 문제, 내 답, 채점 결과를 모두 문서로 남겼습니다.

## 현재 위치

**1~9단계 완료.** 다음은 10단계 종합 실습(React Native)입니다.

**2026-11-24 부터 React Native 기준입니다** (React Native 라이브 코딩 준비). 7·8단계 강의 본문은 웹 React 로 썼고, 각 문서 맨 위의 웹↔RN 대응표로 바꿔 읽습니다. 9단계부터는 `View`·`Text`·`Pressable`·`TextInput` 으로 풉니다.

## 커리큘럼

| 단계 | 주제 | 상태 | 문서 |
|---|---|---|---|
| 1 | 기본 타입 (원시 타입, 배열, 타입 추론, any/unknown) | 완료 (보충 문제까지) | [docs/01-basic-types.md](docs/01-basic-types.md) |
| 2 | 함수 타입 | 완료 (4문제 모두 정답) | [docs/02-functions.md](docs/02-functions.md) |
| 3 | 객체 타입 (type/interface, ?, readonly, 확장) | 완료 | [docs/03-objects.md](docs/03-objects.md) |
| 4 | 유니온과 타입 좁히기 | 완료 | [docs/04-union-narrowing.md](docs/04-union-narrowing.md) |
| 5 | 제네릭 | 완료 | [docs/05-generics.md](docs/05-generics.md) |
| 6 | Promise와 async/await | 완료 | [docs/06-async.md](docs/06-async.md) |
| 7 | React + TS 기초 (props, 함수 props, children, 이벤트 타입, map/key) | 완료 (보충 문제까지) | [docs/07-react-basics.md](docs/07-react-basics.md) |
| 8 | useState (상태 타입, 이전 값 업데이트, 객체·배열 상태, 입력창 연결) | 완료 (보충 문제까지) | [docs/08-use-state.md](docs/08-use-state.md) |
| 9 | useEffect (실행 시점, 의존성 배열, 정리 함수, 데이터 불러오기) | 완료 (보충 3차까지, RN 기준) | [docs/09-use-effect.md](docs/09-use-effect.md) |
| 10 | 종합 실습 (API 호출 → 상태 저장 → 화면 표시, React Native) | **예정 ← 여기서 이어감** | - |

진행 상황, 채점 요약, 자주 틀린 점은 [docs/PROGRESS.md](docs/PROGRESS.md) 에 정리했습니다.

## 다른 컴퓨터에서 이어서 공부하기

1. 저장소를 받습니다.

   ```sh
   git clone https://github.com/ironelder/ReactStudy.git
   cd ReactStudy
   ```

2. Claude Code 에서 이 폴더를 열고 아래처럼 요청합니다.

   > `BasicStudy/docs/PROGRESS.md 를 읽고, 학습 모드로 10단계 종합 실습(React Native)을 강의부터 시작해 줘. 문제를 내고 내 답을 채점한 뒤 보충 문제까지 진행하는 방식으로.`

## 실습 환경

- TypeScript: [TypeScript Playground](https://www.typescriptlang.org/play) (설치 없이 브라우저에서 확인)
- React Native: [Expo Snack](https://snack.expo.dev) (설치 없이 브라우저에서 휴대폰 화면 미리보기), 또는 로컬에서 `npx create-expo-app@latest my-app` → `npx expo start`
- 웹 React (7·8단계 강의 본문 예제): StackBlitz 의 React + TypeScript 템플릿, 또는 로컬에서 `npm create vite@latest my-app -- --template react-ts`

## 문서 목록

- [docs/PROGRESS.md](docs/PROGRESS.md): 진행 상태, 단계별 채점 요약, 복습 포인트, 다음에 할 일
- [docs/01-basic-types.md](docs/01-basic-types.md) ~ [docs/06-async.md](docs/06-async.md): 단계별 강의·문제·내 답·채점
- [docs/07-react-basics.md](docs/07-react-basics.md): 7단계 강의·문제·내 답·채점·보충 문제
- [docs/08-use-state.md](docs/08-use-state.md): 8단계 강의·문제·내 답·채점·보충 문제
- [docs/09-use-effect.md](docs/09-use-effect.md): 9단계 강의·문제·내 답·채점·보충 문제(3차까지)
