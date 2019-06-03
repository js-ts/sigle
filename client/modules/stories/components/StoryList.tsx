import React, { useState, useEffect, useReducer } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '../../../components';
import { PrivateStory, PublicStory } from '../../../models';
import { StoryItem } from './StoryItem';

const StoryListContainer = styled.div`
  ${tw`border-t border-solid border-grey`};
`;

export const EmptyListContainer = styled.div`
  ${tw`flex flex-col items-center justify-center mt-8`};
`;

const EmptyListImage = styled.img`
  ${tw`mb-4`};
  width: 250px;
`;

type Action =
  | { type: 'fetching' }
  | { type: 'success'; privateStories: any; publicStories: any }
  | { type: 'error' };

interface State {
  status?: 'fetching' | 'success' | 'error';
  error?: string;
  privateStories?: any;
  publicStories?: any;
}

const initialState: State = {
  status: undefined,
  error: undefined,
  privateStories: undefined,
  publicStories: undefined,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'fetching':
      return { ...initialState, status: 'fetching' };
    case 'success':
      return {
        ...state,
        status: 'success',
        privateStories: action.privateStories,
        publicStories: action.publicStories,
      };
    case 'error':
      return { ...state, status: 'error' };
    default:
      throw new Error();
  }
};

export const StoryList = () => {
  // TODO error state
  const [tab, setTab] = useState<'private' | 'public'>('private');
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchStories = async () => {
    dispatch({ type: 'fetching' });
    try {
      const privateStories = await PrivateStory.fetchOwnList({
        sort: '-createdAt',
      });
      const publicStories = await PublicStory.fetchOwnList({
        sort: '-createdAt',
      });
      dispatch({ type: 'success', privateStories, publicStories });
    } catch (error) {
      dispatch({ type: 'error' });
      // TODO show error message
    }
  };

  const deleteStory = async (storyId: string) => {
    const stories =
      tab === 'private' ? state.privateStories : state.publicStories;
    if (!stories) {
      return;
    }

    // TODO nice confirm
    const result = confirm('Do you really want to delete this story?');
    if (!result) {
      return;
    }
    try {
      const index = stories.findIndex(
        (story: any) => story.attrs._id === storyId
      );
      if (index === -1) {
        throw new Error('Story not found in list');
      }
      const story = stories[index];
      await story.destroy();
      stories.splice(index, 1);
      dispatch({
        type: 'success',
        privateStories: tab === 'private' ? stories : state.privateStories,
        publicStories: tab === 'public' ? stories : state.publicStories,
      });
      // TODO nice notify
      alert('Story deleted successfully');
    } catch (error) {
      // TODO notify user with error message
      alert(error.message);
    }
  };

  const publishStory = () => {
    alert('TODO');
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <React.Fragment>
      <Tabs
        index={tab === 'private' ? 0 : 1}
        onChange={(index: number) => setTab(index === 0 ? 'private' : 'public')}
      >
        <TabList>
          <Tab>
            Draft (
            {state.status === 'fetching'
              ? '...'
              : state.privateStories && state.privateStories.length}
            )
          </Tab>
          <Tab>
            Published (
            {state.status === 'fetching'
              ? '...'
              : state.publicStories && state.publicStories.length}
            )
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <StoryListContainer>
              {/* TODO nice illustration */}
              {tab === 'private' &&
                state.privateStories &&
                state.privateStories.length === 0 && (
                  <EmptyListContainer>
                    <EmptyListImage
                      src="/static/images/three.png"
                      alt="Empty list"
                    />
                    <p>Shoot the "new story" button to start.</p>
                  </EmptyListContainer>
                )}

              {tab === 'private' &&
                state.privateStories &&
                state.privateStories.map((story: any) => (
                  <StoryItem
                    key={story.attrs._id}
                    story={story}
                    onDelete={deleteStory}
                    onPublish={publishStory}
                  />
                ))}
            </StoryListContainer>
          </TabPanel>

          <TabPanel>
            <StoryListContainer>
              {/* TODO nice illustration */}
              {tab === 'public' &&
                state.publicStories &&
                state.publicStories.length === 0 && (
                  <EmptyListContainer>
                    <EmptyListImage
                      src="/static/images/three.png"
                      alt="Empty list"
                    />
                    <p>Shoot the "new story" button to start.</p>
                  </EmptyListContainer>
                )}

              {tab === 'public' &&
                state.publicStories &&
                state.publicStories.map((story: any) => (
                  <StoryItem
                    key={story.attrs._id}
                    story={story}
                    onDelete={deleteStory}
                    onPublish={publishStory}
                  />
                ))}
            </StoryListContainer>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};