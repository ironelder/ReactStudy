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
