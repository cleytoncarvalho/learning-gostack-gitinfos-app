import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';

import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Loading,
  LoadingEndList,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    starsCountByPage: 0,
    page: 1,
    loading: true,
    loadingEndList: false,
    refreshing: false,
  };

  async componentDidMount() {
    this.load();
  }

  load = async (page = 1) => {
    const { stars } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      starsCountByPage: response.data.length,
      page,
      loading: false,
      loadingEndList: false,
      refreshing: false,
    });
  };

  loadMore = () => {
    const { page, starsCountByPage } = this.state;

    if (starsCountByPage < 30) {
      return;
    }

    this.setState({ loadingEndList: true });

    const nextPage = page + 1;

    this.load(nextPage);
  };

  refreshList = () => {
    this.setState({ refreshing: true, stars: [] }, this.load);
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, loadingEndList, refreshing } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <Loading>
            <ActivityIndicator size={50} color="#7159c1" />
          </Loading>
        ) : (
          <Stars
            data={stars}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}

        <LoadingEndList>
          {loadingEndList && <ActivityIndicator color="#7159c1" />}
        </LoadingEndList>
      </Container>
    );
  }
}
