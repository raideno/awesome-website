import React from 'react'
import * as yaml from 'js-yaml'

import {
  Box,
  Button,
  Dialog,
  Flex,
  IconButton,
  Tabs,
  Text,
} from '@radix-ui/themes'
import { Portal } from '@radix-ui/react-dialog'
import { CopyIcon, GearIcon } from '@radix-ui/react-icons'

import { useList } from '@/context/list'

import ChangesView from '@/components/layout/changes'

export interface SettingsButtonProps {}

export const SettingsButton: React.FC<SettingsButtonProps> = () => {
  const list = useList()

  const yamlCode = React.useMemo(() => {
    return {
      old: yaml.dump(list.content.old, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      }),
      new: yaml.dump(list.content.new, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      }),
    }
  }, [list.content])

  const handleCopy = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        alert('YAML content copied to clipboard!')
      })
      .catch((err) => {
        console.error('Failed to copy:', err)
      })
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton variant="classic">
          <GearIcon />
        </IconButton>
      </Dialog.Trigger>
      <Portal container={document.body}>
        <Dialog.Content style={{ minWidth: '600px' }}>
          <Flex direction={'column'} gap={'4'}>
            <Box>
              <Dialog.Title>Settings</Dialog.Title>
              <Dialog.Description>
                Configure your settings below.
              </Dialog.Description>
            </Box>
            <Tabs.Root onChange={(value) => value}>
              <Tabs.List>
                <Tabs.Trigger value="old">Old</Tabs.Trigger>
                <Tabs.Trigger value="changes">Changes</Tabs.Trigger>
                <Tabs.Trigger value="new">Updated</Tabs.Trigger>
              </Tabs.List>
              <Box className="mt-3">
                <Tabs.Content value="old">
                  <Flex direction={'column'} gap={'2'}>
                    <pre
                      style={{
                        background: '#1e1e1e',
                        color: '#abb2bf',
                        padding: '16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        overflow: 'auto',
                        maxHeight: 'min(512px, 80vh)',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      <code>{yamlCode.old}</code>
                    </pre>
                    <Button
                      onClick={handleCopy.bind(null, yamlCode.old)}
                      variant="outline"
                      className="!w-full cursor-pointer"
                    >
                      <CopyIcon />
                      <Text>Copy Content</Text>
                    </Button>
                  </Flex>
                </Tabs.Content>
                <Tabs.Content value="changes">
                  <Box
                    style={{
                      maxHeight: 'min(512px, 80vh)',
                      overflow: 'auto',
                    }}
                  >
                    <ChangesView
                      oldData={list.content.old}
                      newData={list.content.new}
                    />
                  </Box>
                </Tabs.Content>
                <Tabs.Content value="new">
                  <Flex direction={'column'} gap={'2'}>
                    <pre
                      style={{
                        background: '#1e1e1e',
                        color: '#abb2bf',
                        padding: '16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        overflow: 'auto',
                        maxHeight: 'min(512px, 80vh)',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      <code>{yamlCode.new}</code>
                    </pre>
                    <Button
                      onClick={handleCopy.bind(null, yamlCode.new)}
                      className="!w-full cursor-pointer"
                      variant="outline"
                    >
                      <CopyIcon />
                      <Text>Copy Content</Text>
                    </Button>
                  </Flex>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Flex>
        </Dialog.Content>
      </Portal>
    </Dialog.Root>
  )
}
