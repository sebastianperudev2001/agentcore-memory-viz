Feature: List Memory Resources
  As a developer debugging my agent
  I want to list memory resources in my AWS account
  So that I can see which memories are available

  Scenario: Return cached memory resources when available
    Given a cached list of memory resources
    When I request the list of memory resources
    Then I receive 1 memory resource without calling AgentCore

  Scenario: Fetch from AgentCore on cache miss
    Given no cached memory resources
    And AgentCore has 1 memory resource
    When I request the list of memory resources
    Then I receive 1 memory resource from AgentCore
    And the result is stored in cache
