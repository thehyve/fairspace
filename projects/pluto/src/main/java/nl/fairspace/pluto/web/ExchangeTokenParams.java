package nl.fairspace.pluto.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ExchangeTokenParams {
    private String accessToken;
    private String refreshToken;
}
