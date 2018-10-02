package nl.fairspace.pluto.app.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExchangeTokenParams {
    private String accessToken;
    private String refreshToken;
}
