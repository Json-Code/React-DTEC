import React from 'react';
import './style.less';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import { getAuthorData, getAuthorPost, deleteArticle } from './service';
import { UserCenterStateType, ParamsType } from './data';
import { ArticleItemType } from '../home-page/data';
import { message } from 'antd';
import './_mock';

const avatar = require('../../assets/avatar.jpg');

class UserCenter extends React.Component<any, UserCenterStateType> {

  constructor(props: any) {
    super(props);
    this.state = {
      userData: {
        ids: '',
        username: '',
        avatar: '',
        motto: '',
        profession: '',
        company: '',
      },
      articleList: [],
      owner: true,
    }
  }

  componentDidMount() {
    const { params } = this.props.match;
    getAuthorData(params).then((res: any) => {
      // 用户不存在
      if (res.state === 404) {
        this.props.history.push('/exception/404');
      } else {
        if (res.owner) {
          this.setState({ userData: res.data });
        } else {
          this.setState({ userData: res.data, owner: false });
        }
      }
    });
    this.getUserPost(params);
  }

  /**
   * 获取用户发布的文章
   */
  getUserPost = (params: ParamsType) => {
    getAuthorPost(params).then((res: any) => {
      res.data.forEach((item: ArticleItemType) => {
        item.operation = false;
      });
      this.setState({ articleList: res.data }
      );
    })
  }

  /**
   * 打开操作面板
   */
  showOperationPanel = (ids: string) => {
    const { articleList } = this.state;
    articleList.forEach((item: ArticleItemType) => {
      if (item.ids === ids) {
        item.operation = true;
      } else {
        item.operation = false;
      }
    });
    this.setState({ articleList });
  }

  /**
   * 关闭操作面板
   */
  closeOperationPanel = () => {
    const { articleList } = this.state;
    articleList.forEach((item: ArticleItemType) => {
      item.operation = false;
    });
    this.setState({ articleList });
  }

  /**
   * 修改文章
   */
  updateArticle = (ids: string) => {
    this.props.history.push('/edit/' + ids);
  }

  /**
   * 删除文章
   */
  deleteArticle = (ids: string) => {
    const params: ParamsType = { ids };
    const articleListParams: ParamsType = { ids: this.props.match.params.ids };

    deleteArticle(params).then((res: any) => {
      if (!res.state) {
        message.success('删除成功！', 1.5, () => {
          this.getUserPost(articleListParams);
        });
      } else {
        message.error(res.msg, 1.5);
      }
    })
  }

  render() {
    const { userData, owner, articleList } = this.state;

    return (
      <>
        <Header />
        <main className="container user-center" onClick={this.closeOperationPanel}>
          <section className="user-panel">
            <div className="base-data clearfix">
              <div className="avatar">
                <img src={avatar} alt="" />
              </div>
              <div className="info">
                <p className="username">{userData.username}</p>
                <p className="job">
                  <i className="iconfont icon-job"></i>
                  {userData.profession || '你的职业是什么？'}<span className="divier">|</span>{userData.company || '暂无'}
                </p>
                <p className="motto">
                  <i className="iconfont icon-card"></i>
                  {userData.motto || '你的信仰是什么？'}
                </p>
                <div className="btn-group">
                  {
                    owner ?
                      <Link to='/user/setting/profile'>编辑个人资料</Link> :
                      <>
                        <button className="letter">私信</button>
                        <button className="follow">关注</button>
                      </>
                  }
                </div>
              </div>
            </div>
            <ul className="tab-card">
              <li>动态</li>
              <li>专栏</li>
              <li>沸点</li>
              <li>分享</li>
              <li>赞</li>
              <li>小册</li>
            </ul>
            <div className="dynamic-panel">
              {
                articleList.map((item: ArticleItemType) => (
                  <div className="dynamic" key={item.ids}>
                    <div className="base-info clearfix">
                      <div className="avatar">
                        <img src={avatar} alt="" />
                      </div>
                      <div className="info">
                        <p className="username">{userData.username}</p>
                        <p>{userData.profession || '暂无'}<span>·</span>{item.date}</p>
                      </div>
                    </div>
                    <Link to={`/article/${item.ids}`} className="article">
                      <p className="title">
                        <span>{item.typeName}</span>
                        {item.title}
                      </p>
                      <p className="desc">{item.des}</p>
                    </Link>
                    <div className="action-box">
                      <div className="action-item">
                        <i className="iconfont icon-like"></i>{item.likes === 0 ? '赞' : item.likes}
                      </div>
                      <div className="action-item">
                        <i className="iconfont icon-chat"></i>评论
                      </div>
                      <div className="action-item">
                        <i className="iconfont icon-share"></i>分享
                      </div>
                      {owner && <div className="action-item" onClick={(e) => { e.stopPropagation(); this.showOperationPanel(item.ids) }}>
                        <i className="iconfont icon-manage"></i>操作
                        {item.operation && <ul className="operation">
                          <li onClick={() => this.updateArticle(item.ids)}>修改</li>
                          <li onClick={() => this.deleteArticle(item.ids)}>删除</li>
                        </ul>}
                      </div>}
                    </div>
                  </div>
                ))
              }
            </div>
          </section>
          <aside className="user-aside">
            <section className="achievement">
              <div className="title">个人成就</div>
              <ul className="achievement-list">
                <li><i className="iconfont icon-like"></i>文章被点赞 245</li>
                <li><i className="iconfont icon-view"></i>文章被阅读 12,256</li>
                <li><i className="iconfont icon-collection"></i>文章被收藏 12,125</li>
              </ul>
            </section>
            <section></section>
          </aside>
        </main>
        <Footer />
      </>
    )
  }
}

export default UserCenter;