export interface AwesomeListRepository {
  id: string
  repositoryName: string
  repositoryOwner: string
  createdAt: Date
  lastUpdated: Date
  version: string
  status: 'building' | 'active' | 'error'
}
