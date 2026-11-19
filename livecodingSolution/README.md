# 투표 화면 라이브 코딩 학습 자료

Kotlin 개발자가 TypeScript와 React Native의 투표 화면·비동기 처리·외부 상태 저장소를 연습하며 이어서 공부하기 위한 독립 자료입니다. 원문을 확보하지 못한 항목은 학습 메모 기반 가상 연습으로 표시했습니다.

## 문서

- [학습 현황과 다음 순서](STUDY-STATUS.md)
- [개념 빠른 참고](CONCEPTS.md)
- [문제 1: 낙관적 투표](01-problem-optimistic-vote.md)
- [문제 2: 재시도와 서버 기준 마감](02-problem-retry-deadline.md)
- [문제 3: 순번 기반 실시간 동기화](03-problem-live-sync.md)
- [문제 4: React Native 투표 화면](04-vote-screen.md)
- [문제 5: 실시간 알림 묶기](05-live-batching.md)
- [문제 6: 재연결과 동기화](06-reconnect.md)
- [문제 7: 종료와 정리](07-stop-cleanup.md)
- [문제 8: 버전이 있는 실시간 갱신](08-versioned-updates.md)
- [자급형 화면 코드](code/VoteScreen.answer.tsx)

## 다른 컴퓨터에서 이어가기

저장소를 복제한 뒤 저장소 루트에서 아래 명령으로 최신 자료를 받으세요. 다른 PC의 사용자 홈 경로를 가정하지 않고 저장소 상대 경로를 사용합니다.

```sh
git pull --ff-only
```

그다음 `livecodingSolution/README.md`와 `livecodingSolution/STUDY-STATUS.md`를 읽으세요.

## 다음 세션에 붙여 넣을 요청

> `livecodingSolution/README.md`와 `livecodingSolution/STUDY-STATUS.md`를 읽고 Kotlin 개발자 기준으로 TypeScript/React Native 학습을 이어가 줘. 한 번에 문제 하나만 내고, 내가 답하기 전에는 정답을 공개하지 마. 힌트는 요청하면 규칙 하나만 주고, 정답을 요청하면 코드 블록별 설명과 자주 하는 실수 표를 제공해 줘. 문제 8 정답 설명까지 확인했고, 다음 새 문제는 아직 작성되지 않은 문제 9야. 내가 “다음”이라고 하면 Kotlin 대응을 포함한 새 가상 응용 문제 9를 한 개 내고 답하기 전에는 정답을 공개하지 마. 복습은 내가 요청할 때 진행해 줘.
