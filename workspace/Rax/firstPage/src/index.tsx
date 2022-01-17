import "./index.less";

interface IndexProps {
  name: string;
}
const Index = (props: IndexProps) => {
  const toSecondPage = () => {
    wx.navigateTo({
      url: "/pages/subpackage-1/secondPage/index"
    });
  };
  console.log(props);
  return (
    <view className="rax-demo">
      Hello World, I am secondPage!
      <button onClick={toSecondPage}>to secondPage</button>
    </view>
  );
};

export default Index;
