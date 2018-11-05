"""
OpenID Connect Authenticator
"""


import json
import os
import base64
import urllib

from tornado.auth import OAuth2Mixin
from tornado import gen

from tornado.httputil import url_concat
from tornado.httpclient import HTTPRequest, AsyncHTTPClient

from jupyterhub.auth import LocalAuthenticator

from traitlets import Unicode, Dict, Bool

from oauthenticator.oauth2 import OAuthLoginHandler, OAuthenticator


class OpenIDConnectEnvMixin(OAuth2Mixin):
    pass


class OpenIDConnectLoginHandler(OAuthLoginHandler, OpenIDConnectEnvMixin):
    @property
    def scope(self):
        return self.authenticator.scope


class OpenIDConnectOAuthenticator(OAuthenticator):

    openid_url = Unicode(
        os.environ.get('OPENID_CONNECT_URL', ''),
        help="OpenID Connect endpoint URL"
    ).tag(config=True)

    session_url = Unicode(
        os.environ.get('SESSION_URL', ''),
        help="URL for obtaining JSESSIONID"
    ).tag(config=True)

    login_service = Unicode(
        "OpenID Connect",
        config=True
    )

    login_handler = OpenIDConnectLoginHandler

    extra_params = Dict(
        os.environ.get('OAUTH2_AUTHENTICATION_PARAMS', {}),
        help="Extra parameters for first POST request"
    ).tag(config=True)

    username_key = Unicode(
        os.environ.get('OAUTH2_USERNAME_KEY', 'preferred_username'),
        config=True,
        help="Userdata username key from returned json for USERDATA_URL"
    )
    userdata_params = Dict(
        os.environ.get('OAUTH2_USERDATA_PARAMS', {}),
        help="Userdata params to get user data login information"
    ).tag(config=True)

    tls_verify = Bool(
        os.environ.get('OAUTH2_TLS_VERIFY', 'True').lower() in {'true', '1'},
        config=True,
        help="Disable TLS verification on http request"
    )

    scope = 'offline_access'

    def _connect_url(self):
        if self.openid_url.endswith('/'):
            return self.openid_url
        else:
            return self.openid_url + '/'

    @gen.coroutine
    def authenticate(self, handler, data=None):
        code = handler.get_argument("code")
        # TODO: Configure the curl_httpclient for tornado
        http_client = AsyncHTTPClient()

        params = dict(
            redirect_uri=self.get_callback_url(handler),
            code=code,
            grant_type='authorization_code',
            scope='offline_access'
        )
        params.update(self.extra_params)

        url = self._connect_url() + 'token'

        b64key = base64.b64encode(
            bytes(
                "{}:{}".format(self.client_id, self.client_secret),
                "utf8"
            )
        )

        headers = {
            "Accept": "application/json",
            "User-Agent": "JupyterHub",
            "Authorization": "Basic {}".format(b64key.decode("utf8"))
        }
        req = HTTPRequest(url,
                          method="POST",
                          headers=headers,
                          validate_cert=self.tls_verify,
                          body=urllib.parse.urlencode(params)  # Body is required for a POST...
                          )

        resp = yield http_client.fetch(req)

        resp_json = json.loads(resp.body.decode('utf8', 'replace'))

        access_token = resp_json['access_token']
        refresh_token = resp_json.get('refresh_token', None)
        token_type = resp_json['token_type']
        scope = (resp_json.get('scope', '')).split(' ')

        self.log.debug("Authentication tokens received:  %s", resp_json)

        # Determine who the logged in user is
        headers = {
            "Accept": "application/json",
            "User-Agent": "JupyterHub",
            "Authorization": "{} {}".format(token_type, access_token)
        }

        url = url_concat(self._connect_url() + 'userinfo', self.userdata_params)

        req = HTTPRequest(url,
                          method='GET',
                          headers=headers,
                          validate_cert=self.tls_verify,
                          )
        resp = yield http_client.fetch(req)
        resp_json = json.loads(resp.body.decode('utf8', 'replace'))
        oauth_user = resp_json

        if not resp_json.get(self.username_key):
            self.log.error("OAuth user contains no key %s: %s", self.username_key, resp_json)
            return

        # Get the session id
        session_id = ''
        if self.session_url:
            req = HTTPRequest(self.session_url,
                              method='POST',
                              headers={'Content-Type': 'application/json'},
                              validate_cert=self.tls_verify,
                              body=json.dumps({'accessToken': access_token, 'refreshToken': refresh_token})
                              )
            resp = yield http_client.fetch(req)
            resp_json = json.loads(resp.body.decode('utf8', 'replace'))
            session_id = resp_json['sessionId']

        return {
            'name': oauth_user.get(self.username_key),
            'auth_state': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'oauth_user': oauth_user,
                'scope': scope,
                'session_id': session_id
            }
        }

    @gen.coroutine
    def pre_spawn_start(self, user, spawner):
        auth_state = yield user.get_auth_state()
        if auth_state:
            spawner.environment['SESSION_ID'] = auth_state['session_id']

    def get_handlers(self, app):
        OpenIDConnectEnvMixin._OAUTH_ACCESS_TOKEN_URL = self._connect_url() + 'token'
        OpenIDConnectEnvMixin._OAUTH_AUTHORIZE_URL = self._connect_url() + 'auth'
        return super().get_handlers(app)

class LocalOpenIDConnectOAuthenticator(LocalAuthenticator, OpenIDConnectOAuthenticator):

    """A version that mixes in local system user creation"""
    pass
