import React from 'react'

import { Button, Text } from '@radix-ui/themes'
import { ExternalLinkIcon, ReloadIcon } from '@radix-ui/react-icons'

import type { Workflow } from '@/hooks/workflow-status'

import { Banner } from '@/components/ui/banner'
import { useWorkflowStatus } from '@/hooks/workflow-status'

const getBannerColor = (
  workflow: Workflow,
): 'blue' | 'green' | 'red' | 'orange' | 'amber' | 'gray' => {
  switch (workflow.status) {
    case 'in_progress':
      return 'blue'
    case 'queued':
      return 'orange'
    case 'completed':
      return workflow.conclusion === 'success' ? 'green' : 'red'
    default:
      return 'orange'
  }
}

const getStatusText = (workflow: Workflow) => {
  switch (workflow.status) {
    case 'in_progress':
      return 'Website is being updated... Editing is temporarily disabled.'
    case 'queued':
      return 'Website update is queued... Editing is temporarily disabled.'
    case 'completed':
      return workflow.conclusion === 'success'
        ? 'Website has been updated successfully!'
        : 'Website update failed.'
    default:
      return 'Updating website... Editing is temporarily disabled.'
  }
}

export const WorkflowStatusBanner: React.FC = () => {
  const { isWorkflowRunning, workflow } = useWorkflowStatus()

  if (!isWorkflowRunning || !workflow) {
    return null
  }

  return (
    <Banner
      color={getBannerColor(workflow)}
      left={
        <>
          <ReloadIcon className="animate-spin" />
          <Text>{getStatusText(workflow)}</Text>
        </>
      }
      right={
        <>
          <Button
            variant="classic"
            size="1"
            color="gray"
            onClick={() => window.open(workflow.html_url, '_blank')}
          >
            <ExternalLinkIcon />
            View Progress
          </Button>
        </>
      }
    />
  )
}
