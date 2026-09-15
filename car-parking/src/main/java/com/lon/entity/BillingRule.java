package com.lon.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * <p>
 * 基础计费规则表
 * </p>
 *
 * @author Long
 * @since 2026-09-13
 */
@Getter
@Setter
@TableName("billing_rule")
public class BillingRule implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 计费规则主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 停车场ID，逻辑关联parking_lot.id
     */
    private Long parkingLotId;

    /**
     * 免费分钟数
     */
    private Integer freeMinutes;

    /**
     * 首小时价格
     */
    private BigDecimal firstHourPrice;

    /**
     * 超出首小时后每小时价格
     */
    private BigDecimal additionalHourPrice;

    /**
     * 单日封顶金额
     */
    private BigDecimal dailyCapAmount;

    /**
     * 状态：0停用，1生效
     */
    private Byte status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
