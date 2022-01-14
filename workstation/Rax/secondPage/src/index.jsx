import { createElement } from 'rax';

const Index = () => {
  const toFirstPage = () => {
    wx.navigateTo({
      url: "/pages/main/firstPage/index"
    })
  }
  return <view>Hello World, I am secondPage!<button onClick={toFirstPage}>to toFirstPage</button></view>
};

export default Index;
