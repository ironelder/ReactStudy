# 문제 4. RN 투표 화면 — 정답과 해설

> 이 문서는 원문 문제 C가 아니라 사용자 노트 기반으로 재구성한 가상 연습의 정답이다. 초기화된 controller를 연결하는 화면 단계만 다룬다. controller 초기화와 `liveCounts.start/stop`은 부모가 맡는다.

## 문제 요약

`VoteState`의 `counts: Record<string, number>`, `ticketsLeft`, `status`, `error`를 `useSyncExternalStore`로 구독한다. 선택된 `candidateId`의 득표수와 남은 투표권을 표시하고, submitting·투표권 소진·closed일 때 버튼을 비활성화한다. 누르면 `controller.vote(candidateId)`를 호출하며, error 상태에서 오류 문구를 표시한다.

## 완성 코드

```tsx
import { useSyncExternalStore } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export type VoteState = {
  counts: Record<string, number>;
  ticketsLeft: number;
  status: 'idle' | 'submitting' | 'error' | 'closed';
  error: string | null;
};

export type VoteController = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => VoteState;
  vote: (candidateId: string) => Promise<void>;
};

export type VoteScreenProps = {
  controller: VoteController;
  candidateId: string;
};

export function VoteScreen({ controller, candidateId }: VoteScreenProps) {
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
  );

  const count = state.counts[candidateId] ?? 0;
  const disabled =
    state.status === 'submitting' ||
    state.ticketsLeft <= 0 ||
    state.status === 'closed';

  return (
    <View>
      <Text>{count}표</Text>
      <Text>남은 투표권 {state.ticketsLeft}장</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{
          disabled,
          busy: state.status === 'submitting',
        }}
        disabled={disabled}
        onPress={() => void controller.vote(candidateId)}
      >
        {state.status === 'submitting' ? (
          <ActivityIndicator />
        ) : (
          <Text>투표하기</Text>
        )}
      </Pressable>
      {state.status === 'error' && state.error !== null && (
        <Text accessibilityRole="alert">{state.error}</Text>
      )}
    </View>
  );
}
```

## 상태 값이 화면에 도착하는 흐름

아래 controller 코드는 화면 연결을 이해하기 위한 **흐름 설명용 발췌**다. controller 구현 문제의 정답을 새로 정의하는 것이 아니다.

```ts
this.state = {
  counts: { A: 10, B: 7 },
  ticketsLeft: 3,
  status: 'idle',
  error: null,
};
this.getSnapshot = () => this.state;
```

`subscribe`와 `getSnapshot`은 컨트롤러 인스턴스의 `this`를 유지하는 화살표 필드라고 가정한다. 화면이 `useSyncExternalStore(controller.subscribe, controller.getSnapshot)`로 구독하면 반환한 현재 스냅샷이 `state`가 된다. `state.counts`는 전체 후보 맵 `{ A: 10, B: 7 }`이고, `state.counts[candidateId]`는 한 후보의 값이다. `candidateId === 'A'`라면 `state.counts['A']`는 `10`이므로 `count`는 `10`, 화면의 `<Text>{count}표</Text>`는 `10표`를 표시한다. 값의 흐름은 `this.state → getSnapshot() → useSyncExternalStore → state.counts[candidateId] → count → Text`입니다. `ticketsLeft`는 별도의 상태 필드로 `3`이다.

```text
this.state (전체 상태 객체) → getSnapshot() → 화면 state
→ state.counts[candidateId] → count → Text
```

상태가 바뀌지 않았으면 `getSnapshot`은 같은 객체 참조를 반환해야 한다. 변경 시에는 새 snapshot 객체를 만들어야 React가 변경을 감지한다.

## 블록별 설명과 Kotlin 대응

### 타입 계약

`VoteState`는 화면에 필요한 스냅샷이며 `VoteController`는 구독, snapshot 조회, 투표 호출을 제공한다. Kotlin에서는 상태를 `data class`로, `counts`를 `Map<String, Int>`로 대응해 생각할 수 있다. 다만 TypeScript 함수 타입과 Kotlin 인터페이스/코루틴은 같은 타입 체계가 아니다.

### Props 구조 분해와 store 구독

`VoteScreen({ controller, candidateId }: VoteScreenProps)`의 중괄호는 props 객체에서 두 속성을 꺼내는 JavaScript 구조 분해다. Kotlin의 `props.controller`, `props.candidateId`를 지역 변수로 꺼내 쓰는 흐름과 비슷하다.

`useSyncExternalStore`는 `subscribe`와 `getSnapshot`을 받아 React 렌더와 외부 store를 연결한다. Compose의 `collectAsState()`와 역할은 비슷하지만 동일한 API는 아니다. 여기서는 subscribe가 반환하는 해제 함수를 React가 구독 수명에 맞춰 사용하므로 화면에서 `useEffect` 구독을 중복 생성하지 않는다. controller와 `liveCounts`는 부모 소유이므로 화면에서 dispose/stop하지 않는다.

`subscribe`와 `getSnapshot`은 컨트롤러 인스턴스의 `this`를 유지하는 화살표 필드라고 가정한다. 일반 메서드는 분리 전달 시 인스턴스 문맥이 바인딩되지 않을 수 있다.

### 후보별 카운트와 기본값

`state.counts`는 전체 후보의 맵이고 `state.counts[candidateId]`는 선택한 후보 하나의 수다. `?? 0`은 그 후보가 맵에 아직 없을 때 0으로 표시한다. Kotlin의 `state.counts[candidateId] ?: 0`과 유사하다. `count`는 화면 표시용 단일 숫자이므로 `counts` 맵과 구분한다.

### disabled 조건과 JSX 표현식

`submitting || ticketsLeft <= 0 || closed` 세 조건 중 하나라도 참이면 `disabled`가 참이다. Kotlin도 `||`로 같은 논리식을 표현할 수 있다. JSX의 `{...}` 안에는 JavaScript 표현식을 넣는다. `accessibilityState`는 비활성 및 busy 상태를 보조 기술에 전달한다.

### onPress와 void

`onPress={() => void controller.vote(candidateId)}`에서 `() =>`는 이벤트 때 실행될 화살표 함수다. Kotlin의 람다 콜백과 비슷하다. `void`는 `Promise<void>` 반환값을 기다리지 않고 무시한다는 뜻이며 예외를 잡아 주지 않는다. 이 연습의 `vote`는 실패를 내부 `catch`에서 처리하고 `status/error`로 화면에 알리는 계약이므로 화면에서 또 `catch`할 필요가 없다. 내부 catch가 없는 API라면 호출 쪽에서 reject를 처리해야 한다. Kotlin에서 suspend 함수를 부르는 경우에는 코루틴 문맥이 필요하므로 TS의 `void`와 동작이 같지 않다.

### 로딩 삼항과 오류 조건 렌더링

`status === 'submitting' ? <ActivityIndicator /> : <Text>투표하기</Text>`는 로딩과 일반 버튼 내용 중 하나를 렌더하는 삼항 연산자다. Kotlin의 `if (condition) A else B` 표현식과 비슷하다.

`status === 'error' && error !== null && (...)`는 두 조건이 모두 참일 때만 오류 UI를 만든다. Kotlin에서는 조건문 안에 Composable을 두는 형태로 대응할 수 있다. JSX에서 `&&` 오른쪽은 렌더 결과가 되므로 왼쪽에 숫자 값이 올 때 0이 그대로 렌더되는 실수에 주의한다.

## 자주 하는 실수

| 실수 | 문제 | 확인할 점 |
|---|---|---|
| `counts`와 `count`를 혼동 | 전체 맵을 숫자처럼 표시하거나 잘못된 키를 조회 | `counts`는 전체 맵, `counts[candidateId]`는 한 후보 값, `count`는 표시용 숫자 |
| 다른 문제 상태키 `pending`, `remaining`, `displayCount` 사용 | 이 연습 계약과 맞지 않음 | `submitting`, `ticketsLeft`, `counts` 사용 |
| `getSnapshot`이 매번 새 객체를 반환 | React가 계속 변경으로 판단할 수 있음 | 변경 전에는 동일 참조 유지, 실제 변경 시에만 새 snapshot |
| `subscribe` 해제를 화면 effect에서 또 관리 | 중복 구독과 중복 통지가 생김 | `useSyncExternalStore`가 반환된 해제 함수를 관리 |
| 화면에서 controller를 dispose하거나 `liveCounts.stop()` | 부모나 다른 구독자가 쓰는 store를 종료할 수 있음 | 부모가 초기화·시작·정리 담당 |
| `void`가 Promise 오류를 처리한다고 오해 | reject가 자동으로 잡히지 않음 | 여기서는 vote 내부 catch 후 state.error로 알림 |
| `error`만 검사하고 null은 무시 | 오류 문구가 없는데 alert를 렌더할 수 있음 | error 상태와 `error !== null` 모두 확인 |
| RN 화면 상태와 화면 내부 state를 이중 보관 | 서로 다른 값이 표시될 수 있음 | 외부 snapshot을 직접 렌더 |

## 검증 범위

- `code/VoteScreen.answer.tsx`를 인접 React Native 연습 패키지에 설치된 TypeScript `7.0.2`, React, React Native 타입으로 단독 검사했고 통과했다.
- RN 앱/기기에서 실행하지 않았다.
- 원래 연습 폴더와 테스트가 없으므로 원래 테스트는 재실행하지 않았고 6/6 통과를 주장하지 않는다.
- 기존 원본과 테스트 파일은 수정하지 않았다.
