import org.apache.commons.codec.binary.Hex;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.Charset;
import java.security.GeneralSecurityException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public final class HmacGenerator {
    private static final String ALGORITHM = "HmacSHA256";
    private static final Charset STANDARD_CHARSET = Charset.forName("UTF-8");

    /**
     * Generate HMAC signature
     * @param method
     * @param uri http request uri
     * @param secretKey secret key that Coupang partner granted for calling open api
     * @param accessKey access key that Coupang partner granted for calling open api
     * @return HMAC signature
     */
    public static String generate(String method, String uri, String secretKey, String accessKey) {
        String[] parts = uri.split("\\?");
        if (parts.length > 2) {
            throw new RuntimeException("incorrect uri format");
        } else {
            String path = parts[0];
            String query = "";
            if (parts.length == 2) {
                query = parts[1];
            }

            SimpleDateFormat dateFormatGmt = new SimpleDateFormat("yyMMdd'T'HHmmss'Z'");
            dateFormatGmt.setTimeZone(TimeZone.getTimeZone("GMT"));
            String datetime = dateFormatGmt.format(new Date());
            String message = datetime + method + path + query;

            String signature;
            try {
                SecretKeySpec signingKey = new SecretKeySpec(secretKey.getBytes(STANDARD_CHARSET), ALGORITHM);
                Mac mac = Mac.getInstance(ALGORITHM);
                mac.init(signingKey);
                byte[] rawHmac = mac.doFinal(message.getBytes(STANDARD_CHARSET));
                signature = Hex.encodeHexString(rawHmac);
            } catch (GeneralSecurityException e) {
                throw new IllegalArgumentException("Unexpected error while creating hash: " + e.getMessage(), e);
            }

            return String.format("CEA algorithm=%s, access-key=%s, signed-date=%s, signature=%s", "HmacSHA256", accessKey, datetime, signature);
        }
    }
}
HTTP 신호를 보내기 전에 Authorization 헤더를 이용하여 HMAC signature를 설정해야합니다.

OpenApiTestApplication.java

import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.impl.client.HttpClientBuilder;

import java.io.IOException;

public final class OpenApiTestApplication {
    private final static String REQUEST_METHOD = "POST";
    private final static String DOMAIN = "https://api-gateway.coupang.com";
    private final static String URL = "/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink";
    // Replace with your own ACCESS_KEY and SECRET_KEY
    private final static String ACCESS_KEY = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
    private final static String SECRET_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

    private final static String REQUEST_JSON = "{\"coupangUrls\": [\"https://www.coupang.com/np/search?component=&q=good&channel=user\",\"https://www.coupang.com/np/coupangglobal\"]}";

    public static void main(String[] args) throws IOException {
        // Generate HMAC string
        String authorization = HmacGenerator.generate(REQUEST_METHOD, URL, SECRET_KEY, ACCESS_KEY);

        // Send request
        StringEntity entity = new StringEntity(REQUEST_JSON, "UTF-8");
        entity.setContentEncoding("UTF-8");
        entity.setContentType("application/json");

        org.apache.http.HttpHost host = org.apache.http.HttpHost.create(DOMAIN);
        org.apache.http.HttpRequest request = org.apache.http.client.methods.RequestBuilder
                .post(URL).setEntity(entity)
                .addHeader("Authorization", authorization)
                .build();

        org.apache.http.HttpResponse httpResponse = org.apache.http.impl.client.HttpClientBuilder.create().build().execute(host, request);

        // verify
        System.out.println(EntityUtils.toString(httpResponse.getEntity()));
    }
}
정상적으로 작동되었다면 콘솔에서 아래 결과를 확인 할 수 있습니다.

{
    "rCode": "0",
    "rMessage": "",
    "data": [
        {
            "originalUrl": "https://www.coupang.com/np/search?component=&q=good&channel=user",
            "shortenUrl": "https://coupa.ng/bgQjht"
        },
        {
            "originalUrl": "https://www.coupang.com/np/coupangglobal",
            "shortenUrl": "https://coupa.ng/bgQjjb"
        }
    ]
}
파트너스 API 사용
이제 파트너스 API를 사용할 준비가 되었습니다. 각 API에 대한 문서와 세부 사항은 파트너스 API 가이드에서 문서 탭을 확인해 주시기 바랍니다.

자주 발생하는 문제
API 사용이 처음이라면 인증과 관련한 아래와 같은 문제가 발생 할 수 있습니다.

Unknown error occurred
Access Key가 잘못 입력되었을 때 아래와 같은 메시지가 출력됩니다.

{
    "code": "ERROR",
    "message": "Unknown error occurred, please contact api-gateway channel for the details.",
    "transactionId": "f57c356c-e3f5-4b71-b45f-3db19f6b092b"
}
Invalid signature
Signature 생성이 잘못되었을 때 아래와 같은 메시지가 출력됩니다.

{
    "code": "ERROR",
    "message": "Invalid signature.",
    "transactionId": "78dcba12-7e64-400a-8f1d-0c185a1f3ce1"
}
Request is not authorized
Authorization 헤더가 없거나 잘못된 값을 설정했을 때 아래와 같은 메시지가 출력됩니다.

{
    "code": "ERROR",
    "message": "Request is not authorized.",
    "transactionId": "9fa11d4c-bcbd-4702-a994-b699f5968d8a",
    "messages": {
        "korean": "미인증된 요청은 허용되지 않습니다. 클라이언트의 정보가 정상적으로 설정되어 있는지 확인 부탁드립니다. (CMDB, 컨수머 토큰 또는 HMAC)",
        "english": "Unauthorized request is denied. Check if the client's credential meets the requirements (CMDB, consumer token or HMAC)."
    }
}
HMAC signature is expired
HMAC signature가 만료 되었을 때 아래와 같은 메시지가 출력됩니다. HMAC signature를 다시 생성해야 합니다.

{
    "code": "ERROR",
    "message": "Specified signature is expired.",
    "transactionId": "2d2ccd2b-2e3f-480b-966d-e9ceedaaa91f"
}
HMAC format is invalid
HMAC signature의 포맷이 올바르지 않을 때 아래와 같은 메시지가 출력됩니다. 위 예시를 사용하여 HMAC signature를 생성하십시오.

{
    "code": "ERROR",
    "message": "HMAC format is invalid.",
    "transactionId": "b806c1f1-1b6c-4ca6-9040-0418f695a315"
}