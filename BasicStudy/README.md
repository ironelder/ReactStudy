# ReactStudy

TypeScript 기본 문법부터 Promise, `useState`, `useEffect`까지 **학습 모드(설명 → 연습 문제 → 채점·피드백)** 로 공부한 기록입니다. 다른 컴퓨터에서도 이어서 공부할 수 있게 강의 본문, 연습 문제, 내 답, 채점 결과를 모두 문서로 남겼습니다.

## 현재 위치

**1~6단계 완료, 7단계(React + TS 기초) 시작 전.** 7단계 강의와 연습 문제 4개는 나왔고, 답은 아직 내지 않았습니다.

## 커리큘럼

| 단계 | 주제 | 상태 | 문서 |
|---|---|---|---|
| 1 | 기본 타입 (원시 타입, 배열, 타입 추론, any/unknown) | 완료 (보충 문제까지) | [docs/01-basic-types.md](docs/01-basic-types.md) |
| 2 | 함수 타입 | 완료 (4문제 모두 정답) | [docs/02-functions.md](docs/02-functions.md) |
| 3 | 객체 타입 (type/interface, ?, readonly, 확장) | 완료 | [docs/03-objects.md](docs/03-objects.md) |
| 4 | 유니온과 타입 좁히기 | 완료 | [docs/04-union-narrowing.md](docs/04-union-narrowing.md) |
| 5 | 제네릭 | 완료 | [docs/05-generics.md](docs/05-generics.md) |
| 6 | Promise와 async/await | 완료 | [docs/06-async.md](docs/06-async.md) |
| 7 | React + TS 기초 (props, 함수 props, children, 이벤트 타입, map/key) | **강의·문제 4개 출제, 답 아직 안 냄 ← 여기서 이어감** | [docs/07-react-basics.md](docs/07-react-basics.md) |
| 8 | useState | 예정 | - |
| 9 | useEffect | 예정 | - |
| 10 | 종합 실습 (API 호출 → 상태 저장 → 화면 표시) | 예정 | - |

진행 상황, 채점 요약, 자주 틀린 점은 [docs/PROGRESS.md](docs/PROGRESS.md) 에 정리했습니다.

## 다른 컴퓨터에서 이어서 공부하기

1. 저장소를 받습니다.

   ```sh
   git clone https://github.com/ironelder/ReactStudy.git
   cd ReactStudy
   ```

2. Claude Code 에서 이 폴더를 열고 아래처럼 요청합니다.

   > `BasicStudy/docs/PROGRESS.md 와 BasicStudy/docs/07-react-basics.md 를 읽고, 학습 모드로 7단계 연습 문제부터 이어서 진행해 줘. 문제를 내고 내 답을 채점한 뒤 다음 단계로 넘어가는 방식으로.`

## 실습 환경

- TypeScript: [TypeScript Playground](https://www.typescriptlang.org/play) (설치 없이 브라우저에서 확인)
- React: StackBlitz 의 React + TypeScript 템플릿, 또는 로컬에서 `npm create vite@latest my-app -- --template react-ts`

## 문서 목록

- [docs/PROGRESS.md](docs/PROGRESS.md): 진행 상태, 단계별 채점 요약, 복습 포인트, 다음에 할 일
- [docs/01-basic-types.md](docs/01-basic-types.md) ~ [docs/06-async.md](docs/06-async.md): 단계별 강의·문제·내 답·채점
- [docs/07-react-basics.md](docs/07-react-basics.md): 7단계 강의와 연습 문제 (답 칸 비어 있음)
