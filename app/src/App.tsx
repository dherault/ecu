import { Ecu } from '@ecu/client'

/* ecu-imports */
import MyComponent1 from './components/MyComponent1'
import MyComponent from './components/MyComponent'

function App() {
  return (
    <Ecu>
      <MyComponent1 />
      <MyComponent1 />
      <MyComponent />
      <MyComponent />
      <MyComponent />
      <MyComponent />
    </Ecu>
  )
}

export default App